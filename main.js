process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
import "./config.js"
import cron from "node-cron"
import { addProduk } from "./lib/digiflazz.js"
import { openAndCloseGC, cekSaldoDG, newChartCrypto, newChartSaham, checkSewa, checkPremium, resetSahamPrice, resetCryptoPrice, resetAll, Backup, resetVolumeSaham, resetVolumeCrypto, clearMemory, OtakuNews, checkGempa, updateSaham, clearTmp, updateCrypto, checkSholat, checkPembayaran } from "./lib/autoScedule.js"
import yargs from "yargs"
import { spawn } from "child_process"
import lodash from "lodash"
import chalk from "chalk"
import { makeWASocket, protoType, serialize } from "./lib/simple.js"
import { Low, JSONFile } from "lowdb"
import pino from "pino"
import { mongoDB, mongoDBV2 } from "./lib/mongoDB.js"
import cloudDBAdapter from "./lib/cloudDBAdapter.js"
import { loadPluginFiles, pluginFolder, pluginFilter } from "./lib/plugins.js"
import { ensureScheduler, makeChild, stopChild } from "./lib/jadibot.js"
import { connectJadibot } from "./lib/connectJadibot.js"
const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = await import("@whiskeysockets/baileys")
const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

protoType()
serialize()

global.API = (name, path = "/", query = {}, apikeyqueryname) =>
  (name in global.config.APIs ? global.config.APIs[name] : name) +
  path +
  (query || apikeyqueryname
    ? "?" +
      new URLSearchParams(
        Object.entries({
          ...query,
          ...(apikeyqueryname
            ? {
                [apikeyqueryname]: global.config.APIKeys[name in global.config.APIs ? global.config.APIs[name] : name],
              }
            : {}),
        })
      )
    : "")

global.timestamp = {
  start: new Date(),
}

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())

let adapter
const dbUri = global.config?.database ?? ""
const dbName = global.config?.nameDB ?? ""

try {
  if (/^https?:\/\//i.test(dbUri)) {
    console.log("Menggunakan cloudDBAdapter")
    adapter = new cloudDBAdapter(dbUri)
  } else if (/^mongodb(\+srv)?:\/\//i.test(dbUri)) {
    console.log(`Menggunakan ${global.config.mongoDBV2 ? "mongoDBV2" : "mongoDB"}`)
    adapter = global.config.mongoDBV2 ? new mongoDBV2(dbUri) : new mongoDB(dbUri)
  } else {
    const filePath = `${dbName ? dbName + "_" : ""}database.json`
    console.log(`Menggunakan file lokal: ${filePath}`)
    adapter = new JSONFile(filePath)
  }

  global.db = new Low(adapter)
  console.log("Inisialisasi database berhasil")
} catch (err) {
  console.error("Gagal menginisialisasi database:", err)
  process.exit(1)
}

global.loadDatabase = async function loadDatabase() {
  if (global.db.READ)
    return new Promise((resolve) =>
      setInterval(async function () {
        if (!global.db.READ) {
          clearInterval(this)
          resolve(global.db.data == null ? global.loadDatabase() : global.db.data)
        }
      }, 1 * 1000)
    )
  if (global.db.data !== null) return
  global.db.READ = true
  await global.db.read().catch(console.error)
  global.db.READ = null
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    settings: {},
    bots: {},
    ...(global.db.data || {}),
  }
  global.db.chain = chain(global.db.data)
}

loadDatabase()

const authFile = `${opts._[0] || "sessions"}`
console.log(chalk.red(`[AUTH] Load AuthFile from ${authFile}`))
const { state, saveCreds } = await useMultiFileAuthState(authFile)
const { version, isLatest } = await fetchLatestBaileysVersion()
console.log(chalk.green(`[BAILEYS] using WA v${version.join(".")}, isLatest: ${isLatest}`))

const connectionOptions = {
  version,
  logger: pino({
    level: "silent",
  }),
  // printQRInTerminal: !global.config.pairingAuth,
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(
      state.keys,
      pino().child({
        level: "silent",
        stream: "store",
      })
    ),
  },
  retryRequestDelayMs: 3000,
  generateHighQualityLinkPreview: true,
}

global.conn = makeWASocket(connectionOptions)
conn.isInit = false

if (global.config.pairingAuth && !conn.authState.creds.registered) {
  let phoneNumber
  const PHONE_CC = await (await fetch("https://raw.githubusercontent.com/clicknetcafe/json-db/refs/heads/main/data/countryphonecode.json")).json()
  if (!!global.config.pairingNumber) {
    phoneNumber = global.config.pairingNumber.replace(/[^0-9]/g, "")

    if (!Object.keys(PHONE_CC).some((v) => phoneNumber.startsWith(v))) {
      console.log(chalk.bgBlack(chalk.redBright("Start with your country's WhatsApp code, Example : 62xxx")))
      process.exit(0)
    }
  } else {
    phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number : `)))
    phoneNumber = phoneNumber.replace(/[^0-9]/g, "")

    if (!Object.keys(PHONE_CC).some((v) => phoneNumber.startsWith(v))) {
      console.log(chalk.bgBlack(chalk.redBright("Start with your country's WhatsApp code, Example : 62xxx")))

      phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number : `)))
      phoneNumber = phoneNumber.replace(/[^0-9]/g, "")
      rl.close()
    }
  }

  setTimeout(async () => {
    let code = await conn.requestPairingCode(phoneNumber)
    code = code?.match(/.{1,4}/g)?.join("-") || code
    console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)))
  }, 3000)
}

loadPluginFiles(pluginFolder, pluginFilter, {
  logger: conn.logger,
  recursiveRead: true,
}).catch(console.error)

if (!opts["test"]) {
  setInterval(async () => {
    if (global.db.data) await global.db.write().catch(console.error)
  }, 30 * 1000)

  let checkBayar = false
  setInterval(async () => {
    if (checkBayar) return
    try {
      checkBayar = true
      await checkPembayaran()
    } catch (e) {
      console.error(e)
    } finally {
      checkBayar = false
    }
  }, 10000)

  cron.schedule(
    "0 0 * * *",
    async () => {
      setTimeout(async () => {
        await resetAll()
        await resetCryptoPrice()
        await resetSahamPrice()
        await resetVolumeSaham()
        await resetVolumeCrypto()
      }, global.config.botKe * 2500 + 20000)
    },
    { scheduled: true, timezone: "Asia/Jakarta" }
  )

  cron.schedule(
    "0 */5 * * *",
    async () => {
      setTimeout(async () => {
        await Backup()
        if (process.env.DIGIFLAZZ_USERNAME && process.env.DIGIFLAZZ_APIKEY && global.config.botUtama) await addProduk()
      }, global.config.botKe * 2500 + 15000)
    },
    { scheduled: true, timezone: "Asia/Jakarta" }
  )

  cron.schedule(
    "0 * * * *",
    async () => {
      setTimeout(async () => {
        clearTmp()
        clearMemory()
        await connectJadibot(false)
        if (process.env.DIGIFLAZZ_USERNAME && process.env.DIGIFLAZZ_APIKEY && global.config.botUtama) await cekSaldoDG()
      }, global.config.botKe * 2500 + 10000)
    },
    { scheduled: true, timezone: "Asia/Jakarta" }
  )

  cron.schedule(
    "*/5 * * * *",
    async () => {
      setTimeout(async () => {
        await updateSaham()
        await newChartCrypto()
        await newChartSaham()

        await checkGempa(global.conn)
        if (global.conns.length > 0) {
          for (let c of global.conns) {
            await checkGempa(c)
          }
        }
      }, global.config.botKe * 2500 + 5000)
    },
    { scheduled: true, timezone: "Asia/Jakarta" }
  )

  cron.schedule(
    "* * * * *",
    async () => {
      await updateCrypto()

      await checkSewa(global.conn)
      if (global.conns.length > 0) {
        for (let c of global.conns) {
          await checkSewa(c)
        }
      }

      await checkPremium()

      await openAndCloseGC(global.conn)
      if (global.conns.length > 0) {
        for (let c of global.conns) {
          await openAndCloseGC(c)
        }
      }

      await checkSholat(global.conn)
      if (global.conns.length > 0) {
        for (let c of global.conns) {
          await checkSholat(c)
        }
      }

      await ensureScheduler()
    },
    { scheduled: true, timezone: "Asia/Jakarta" }
  )
}

if (opts["server"]) await import("./server.js")

async function connectionUpdate(update) {
  const { receivedPendingNotifications, connection, lastDisconnect, isOnline, isNewLogin } = update
  if (isNewLogin) conn.isInit = true
  if (connection == "connecting") console.log(chalk.redBright("Mengaktifkan Bot, Mohon tunggu sebentar..."))
  if (connection == "open") console.log(chalk.green("Tersambung"))
  if (isOnline == true) console.log(chalk.green("Status Aktif"))
  if (isOnline == false) console.log(chalk.red("Status Mati"))
  if (receivedPendingNotifications) console.log(chalk.yellow("Menunggu Pesan Baru"))
  if (connection == "close") console.log(chalk.red("koneksi terputus & mencoba menyambung ulang..."))
  global.timestamp.connect = new Date()
  if (lastDisconnect && lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
    await global.reloadHandler(true)
    console.log(chalk.red("Connecting..."))
  }
  if (global.db.data == null) await global.loadDatabase()
}

process.on("uncaughtException", console.error)

let isInit = true
let handler = await import("./handler.js")

global.reloadHandler = async function (restatConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error)
    if (Object.keys(Handler || {}).length) handler = Handler
  } catch (e) {
    console.error(e)
  }
  if (restatConn) {
    const oldChats = global.conn.chats
    try {
      global.conn.ws.close()
    } catch {}
    conn.ev.removeAllListeners()
    global.conn = makeWASocket(connectionOptions, {
      chats: oldChats,
    })
    isInit = true
  }

  if (!isInit) {
    conn.ev.off("messages.upsert", conn.handler)
    conn.ev.off("group-participants.update", conn.participantsUpdate)
    conn.ev.off("message.delete", conn.onDelete)
    conn.ev.off("connection.update", conn.connectionUpdate)
    conn.ev.off("creds.update", conn.credsUpdate)
  }

  conn.spromote = "@user sekarang admin!"
  conn.sdemote = "@user sekarang bukan admin!"
  conn.welcome = "Hallo @user Selamat datang di @subject\n\n@desc"
  conn.bye = "Selamat tinggal @user"
  conn.sRevoke = "Link group telah diubah ke \n@revoke"

  conn.handler = handler.handler.bind(global.conn)
  conn.participantsUpdate = handler.participantsUpdate.bind(global.conn)
  conn.onDelete = handler.deleteUpdate.bind(global.conn)
  conn.connectionUpdate = connectionUpdate.bind(global.conn)
  conn.credsUpdate = saveCreds.bind(global.conn)

  conn.ev.on("messages.upsert", conn.handler)
  conn.ev.on("group-participants.update", conn.participantsUpdate)
  conn.ev.on("message.delete", conn.onDelete)
  conn.ev.on("connection.update", conn.connectionUpdate)
  conn.ev.on("creds.update", conn.credsUpdate)
  isInit = false
  return true
}

await global.reloadHandler()

async function _quickTest() {
  let test = await Promise.all(
    [spawn("ffmpeg"), spawn("ffprobe"), spawn("ffmpeg", ["-hide_banner", "-loglevel", "error", "-filter_complex", "color", "-frames:v", "1", "-f", "webp", "-"]), spawn("convert"), spawn("magick"), spawn("gm"), spawn("find", ["--version"])].map((p) => {
      return Promise.race([
        new Promise((resolve) => {
          p.on("close", (code) => {
            resolve(code !== 127)
          })
        }),
        new Promise((resolve) => {
          p.on("error", (_) => resolve(false))
        }),
      ])
    })
  )
  let [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test
  let s = (global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find })
  Object.freeze(global.support)

  if (!s.ffmpeg) conn.logger.warn("Please install ffmpeg for sending videos (pkg install ffmpeg)")
  if (s.ffmpeg && !s.ffmpegWebp) conn.logger.warn("Stickers may not animated without libwebp on ffmpeg (--enable-ibwebp while compiling ffmpeg)")
  if (!s.convert && !s.magick && !s.gm) conn.logger.warn("Stickers may not work without imagemagick if libwebp on ffmpeg doesnt isntalled (pkg install imagemagick)")
}

_quickTest()
  .then(() => conn.logger.info("☑️ Quick Test Done"))
  .catch(console.error)

await connectJadibot()
