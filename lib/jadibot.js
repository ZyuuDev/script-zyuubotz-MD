import pino from "pino"
import fs from "fs"
import path from "path"
import os from "os"
import { fileURLToPath } from "url"
import { makeWASocket } from "./simple.js"
import { useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, DisconnectReason, Browsers } from "@whiskeysockets/baileys"

if (!global.conns) global.conns = []
if (!global.jadibotMap) global.jadibotMap = new Map()

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const digit = (s = "") => String(s).replace(/[^0-9]/g, "")

function canon(raw) {
  let n = digit(raw || "")
  if (!n) return ""
  if (n.startsWith("00")) n = n.replace(/^00+/, "")
  if (n.startsWith("0")) n = "62" + n.slice(1)
  return n
}

const normalizeMsisdn = (raw) => canon(raw)

function pickWritableBase() {
  const cands = [process.env.JADIBOT_DIR && path.resolve(process.env.JADIBOT_DIR), path.join(process.cwd(), "sessions-jadibot"), path.join(process.cwd(), ".data", "sessions-jadibot"), path.join(os.tmpdir(), "elaina-jadibot")].filter(Boolean)

  for (const base of cands) {
    try {
      fs.mkdirSync(base, { recursive: true, mode: 0o755 })
      fs.accessSync(base, fs.constants.W_OK)
      return base
    } catch {}
  }
  throw new Error("Tidak ada folder writable. Set env JADIBOT_DIR atau pastikan ./sessions-jadibot writable.")
}

let BASE
try {
  BASE = pickWritableBase()
} catch (e) {
  console.error("⚠️ Warning:", e.message)
  BASE = path.join(os.tmpdir(), "elaina-jadibot-fallback")
  fs.mkdirSync(BASE, { recursive: true })
}

const authDirOf = (msisdn) => path.join(BASE, msisdn)

function setMeta(msisdn, info) {
  const k = canon(msisdn)
  if (global.jadibotMap instanceof Map) {
    global.jadibotMap.set(k, info)
  } else {
    global.jadibotMap[k] = info
  }
}

function getMeta(msisdn) {
  const k = canon(msisdn)
  return global.jadibotMap instanceof Map ? global.jadibotMap.get(k) || {} : global.jadibotMap[k] || {}
}

function delMeta(msisdn) {
  const k = canon(msisdn)
  if (global.jadibotMap instanceof Map) {
    global.jadibotMap.delete(k)
  } else {
    delete global.jadibotMap[k]
  }
}

function getChildByNumber(n) {
  n = canon(n)
  return (global.conns || []).find((c) => canon(c.__number || "") === n)
}

async function bindHandlersToChild(child) {
  if (typeof global.bindHandlersTo === "function") {
    try {
      global.bindHandlersTo(child)
      return
    } catch {}
  }

  const here = path.dirname(fileURLToPath(import.meta.url))
  const candidates = ["../handler.js", "../main.js"]

  let mod = null
  for (const rel of candidates) {
    const abs = path.normalize(path.join(here, rel))
    try {
      mod = await import("file://" + abs)
      break
    } catch {}
  }

  const h = mod?.handler || mod?.default || {}
  const onMsg = (h.handler || h)?.bind?.(child) || (() => {})
  const onPart = (h.participantsUpdate || mod?.participantsUpdate || (() => {}))?.bind?.(child) || (() => {})
  const onDelete = (h.deleteUpdate || mod?.deleteUpdate || (() => {}))?.bind?.(child) || (() => {})

  child.ev.on("messages.upsert", onMsg)
  child.ev.on("group-participants.update", onPart)
  child.ev.on("message.delete", onDelete)

  child.__handlers = {
    onMsg,
    onPart,
    onDelete,
  }

  child.__isSubBot = true
  child.isOwner = () => false
}

function cleanupChildHandlers(child) {
  if (child.__handlers) {
    try {
      child.ev.off("messages.upsert", child.__handlers.onMsg)
      child.ev.off("group-participants.update", child.__handlers.onPart)
      child.ev.off("message.delete", child.__handlers.onDelete)
      delete child.__handlers
    } catch (e) {
      console.error("Error cleaning up handlers:", e)
    }
  }
}

async function stopChild(num, reason = "deleted") {
  const msisdn = canon(num)
  const child = getChildByNumber(msisdn)
  const bot = global.db?.data?.bots || {}
  const jadibot = bot.jadibot || {}

  if (child) {
    try {
      cleanupChildHandlers(child)

      if (child.ws) {
        await child.ws.close()
        await wait(500)
      }
    } catch (e) {
      console.error("Error closing child connection:", e)
    }

    const idx = global.conns.indexOf(child)
    if (idx >= 0) global.conns.splice(idx, 1)
  }

  const jadibotOwner = jadibot[msisdn]?.owner || ""

  if (reason === "deleted" || reason === "expired") {
    try {
      const dir = authDirOf(msisdn)
      if (dir && fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true })
      }
      delete jadibot[msisdn]
    } catch (e) {
      console.error("Error removing session dir:", e)
    }
  }

  delMeta(msisdn)

  if (jadibot[msisdn]) {
    if (reason !== "expired") {
      jadibot[msisdn].aktif = false
      jadibot[msisdn].lastAktif = Date.now()
    }
  }

  let txt = ""
  switch (reason) {
    case "deleted":
      txt = `Bot telah dihapus.\nSessions telah dihapus dari sistem.\n\n_Terimakasih sudah menggunakan layanan jadibot_`
      break

    case "stopped":
      txt = `Bot telah dimatikan.\nUntuk mengaktifkan kembali ketik:\n*.jadibot 628xxxxxxx*`
      break

    case "expired":
      txt = `Masa aktif jadibot telah habis.\nBot ini telah dimatikan otomatis oleh sistem.\n_Terimakasih sudah sewa jadibot_`
      break

    default:
      txt = `Bot telah dimatikan oleh sistem.`
  }

  try {
    const mainConn = global.conn || global.primaryConn || global.mainConn
    if (mainConn) {
      await mainConn.reply(jadibotOwner, txt)
    }
  } catch (e) {
    console.error("Error sending stop notification:", e)
  }

  return true
}

async function makeChild(msisdn, isNew = false, ownerNumber = null) {
  const normalizedMsisdn = canon(msisdn)

  const existingChild = getChildByNumber(normalizedMsisdn)
  if (existingChild) {
    console.log(`🔄 Menghapus koneksi lama untuk ${normalizedMsisdn}...`)

    try {
      cleanupChildHandlers(existingChild)

      if (existingChild.ws) {
        await existingChild.ws.close()
        await wait(800)
      }
    } catch (e) {
      console.error("Error saat menutup koneksi lama:", e)
    }

    const idx = global.conns.indexOf(existingChild)
    if (idx >= 0) {
      global.conns.splice(idx, 1)
      console.log(`✅ Koneksi lama dihapus dari global.conns`)
    }

    await wait(500)
  }

  const dir = authDirOf(normalizedMsisdn)
  fs.mkdirSync(dir, { recursive: true, mode: 0o755 })

  const { state, saveCreds } = await useMultiFileAuthState(dir)
  const { version } = await fetchLatestBaileysVersion()
  const bot = global.db?.data?.bots || {}

  const sock = makeWASocket({
    version,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino().child({ level: "silent", stream: "store" })),
    },
    browser: Browsers.ubuntu("Chrome"),
    syncFullHistory: false,
    markOnlineOnConnect: false,
    connectTimeoutMs: 30_000,
    logger: pino({
      level: "silent",
    }),
  })

  sock.__number = normalizedMsisdn
  sock.__stateDir = dir
  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    const meta = getMeta(normalizedMsisdn) || {}

    if (connection === "open") {
      if (!global.conns.includes(sock)) {
        global.conns.push(sock)
      }

      const info = {
        ...meta,
        jid: sock.user?.id,
        name: sock.user?.name || sock.user?.id,
        number: normalizedMsisdn,
        since: meta?.since || Date.now(),
        dir: sock.__stateDir,
        state: "open",
        expiresAt: bot.jadibot?.[normalizedMsisdn]?.expiredAt || meta.expiresAt,
      }
      setMeta(normalizedMsisdn, info)

      await wait(450)

      try {
        if (isNew) {
          const target = ownerNumber ?? bot.jadibot?.[normalizedMsisdn]?.owner ?? `${normalizedMsisdn}@s.whatsapp.net`
          const exp = info.expiresAt ? new Date(info.expiresAt).toLocaleString("id-ID") : "∞"
          const mainConn = global.conn || global.primaryConn || global.mainConn
          await mainConn.reply(
            target,
            `
Sukses jadibot untuk nomor ini ${normalizedMsisdn} tersambung sebagai ${sock.user?.id}.
*Masa aktif hingga*: ${exp}

_Untuk memperpanjang masa aktif bot, gunakan command_
_*#perpanjangbot 10hari*_
`.trim(),
            null
          )
        }
      } catch (e) {
        console.error("Error sending success message:", e)
      }
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.statusCode
      const isLoggedOut = code === DisconnectReason.loggedOut

      if (isLoggedOut) {
        await stopChild(normalizedMsisdn)
      }
    }
  })

  await bindHandlersToChild(sock)
  sock.__already = !!state?.creds?.registered

  return sock
}

async function requestCodeWithRetry(sock, msisdn, attempts = 5) {
  let last
  for (let i = 0; i < attempts; i++) {
    try {
      await wait(1000 + i * 700)
      const code = await sock.requestPairingCode(canon(msisdn))
      if (!code) throw new Error("pairing code kosong")
      return String(code)
    } catch (e) {
      last = e
      const sc = e?.output?.statusCode || e?.data?.statusCode
      const msg = String(e?.message || "")
      const transient = sc === 428 || /Connection Closed|WebSocket/i.test(msg)
      if (transient && i < attempts - 1) continue
      throw e
    }
  }
  throw last
}

async function restartAfterPair({ msisdn, m, conn, why = "", code = "" }) {
  try {
    if (code == 515) {
      await conn.reply(m.chat, `Pairing diterima (${why}). Menyambungkan ulang…`, m)
    } else {
      await conn.reply(m.chat, `Gagal Pairing (${why}). Menyambungkan ulang…`, m)
    }
  } catch {}

  const ex = getChildByNumber(msisdn)
  if (ex) {
    try {
      cleanupChildHandlers(ex)

      await ex.ws.close()
      await wait(800)
    } catch (e) {
      console.error("Error closing existing connection:", e)
    }

    const i = global.conns.indexOf(ex)
    if (i >= 0) global.conns.splice(i, 1)
  }

  await wait(500)

  const child2 = await makeChild(msisdn)
  return child2
}

async function ensureScheduler() {
  try {
    const bot = global.db?.data?.bots || {}
    const now = Date.now()

    if (bot.jadibot) {
      for (const k of Object.keys(bot.jadibot)) {
        const exp = Number(bot.jadibot[k]?.expiredAt || 0)
        if (exp && now >= exp) {
          await stopChild(k, "expired")
        }
      }
    }
  } catch (e) {
    console.error("Error in ensureScheduler:", e)
  }
}

export { requestCodeWithRetry, ensureScheduler, stopChild, makeChild, getChildByNumber, restartAfterPair, normalizeMsisdn, canon, digit }
