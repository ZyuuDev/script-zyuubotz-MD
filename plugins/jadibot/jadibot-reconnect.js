import { makeChild, stopChild, restartAfterPair, canon, getChildByNumber } from "../../lib/jadibot.js"
import { DisconnectReason } from "@whiskeysockets/baileys"

let handler = async (m, { conn, text, usedPrefix, command, senderKey, isMods }) => {
  let num = canon(text || "")

  const bot = global.db.data.bots

  const jadibot = bot.jadibot

  if (!num) {
    const keys = Object.keys(jadibot).filter((v) => {
      return isMods || jadibot[v].owner === senderKey
    })

    if (keys.length === 0) {
      return conn.reply(m.chat, `❌ Tidak ada sesi jadibot yang ${isMods ? "terdaftar" : "kamu miliki"}.\n\n_Gunakan:_\n*${usedPrefix}jadibot 62xxxxxxxxxx*`, m)
    }

    if (keys.length > 1) {
      const list = await Promise.all(
        keys.map(async (v, i) => {
          const name = await conn.getName(v + "@s.whatsapp.net").catch(() => v)
          const status = jadibot[v].aktif ? "✅ Aktif" : "❌ Tidak Aktif"
          const expired = jadibot[v].expiredAt ? new Date(jadibot[v].expiredAt).toLocaleString("id-ID") : "∞"
          return [`${usedPrefix}${command} ${v}`, (i + 1).toString(), `${name}\n📞 ${v}\n${status}\n📅 Expired: ${expired}`]
        })
      )
      return await conn.textList(m.chat, `Pilih jadibot yang ingin di-reconnect:`, false, list, m)
    } else if (keys.length === 1) {
      num = keys[0]
    }
  }

  if (!num) {
    return conn.reply(m.chat, `❌ Nomor tidak valid.\n\nContoh:\n*${usedPrefix}${command} 62xxxxxxxxxx*`, m)
  }

  if (!jadibot[num]) {
    return conn.reply(m.chat, `❌ Sesi ${num} tidak ditemukan di database.\n\n_Daftar terlebih dahulu dengan:_\n*${usedPrefix}jadibot ${num}*`, m)
  }

  if (!isMods && jadibot[num].owner !== senderKey) {
    return conn.reply(m.chat, `❌ Kamu bukan owner dari jadibot ${num}`, m)
  }

  const now = Date.now()
  const expiredAt = jadibot[num].expiredAt || 0
  if (expiredAt && now >= expiredAt) {
    return conn.reply(m.chat, `❌ Masa aktif jadibot ${num} telah habis.\n\n_Silakan perpanjang terlebih dahulu dengan:_\n*${usedPrefix}perpanjangbot 10hari*`, m)
  }

  const existingChild = getChildByNumber(num)
  if (existingChild?.user?.id) {
    return conn.reply(m.chat, `✅ Bot ${num} sudah terhubung sebagai ${existingChild.user.id}\n\n_Tidak perlu reconnect_`, m)
  }

  await conn.reply(m.chat, `🔄 Menghubungkan ulang sesi ${num}...\n⏳ Mohon tunggu...`, m)

  let child
  let connectionListener

  try {
    child = await makeChild(num)

    if (child?.__already || child?.user?.id) {
      jadibot[num].aktif = true
      jadibot[num].lastReconnectedAt = Date.now()

      const expText = jadibot[num].expiredAt ? new Date(jadibot[num].expiredAt).toLocaleString("id-ID") : "∞"

      await conn.reply(m.chat, `✅ Berhasil menyambungkan ulang sesi ${num}!\n\n🤖 Bot ID: ${child.user?.id}\n📅 Masa aktif hingga: ${expText}\n\n_Bot sudah aktif dan siap digunakan_`, m)
      return
    }

    let waitingPairAck = false

    connectionListener = async ({ connection, lastDisconnect }) => {
      if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.statusCode
        const isLoggedOut = code === DisconnectReason.loggedOut

        if (isLoggedOut) {
          await conn.reply(m.chat, `❌ Sesi ${num} telah keluar (logged out).\n\n_Silahkan daftar ulang dengan:_\n*${usedPrefix}jadibot ${num}*`, m)
          await stopChild(num, "deleted")

          if (child?.ev && connectionListener) {
            child.ev.off("connection.update", connectionListener)
          }
        } else if (!isLoggedOut && (code === 515 || code === 410 || waitingPairAck)) {
          waitingPairAck = false

          if (child?.ev && connectionListener) {
            child.ev.off("connection.update", connectionListener)
          }

          await restartAfterPair({
            msisdn: num,
            m,
            conn,
            why: `code ${code || "stream closed"}`,
            code: code || "stream closed",
          })
        }
      }

      if (connection === "open") {
        jadibot[num].aktif = true
        jadibot[num].lastReconnectedAt = Date.now()

        const expText = jadibot[num].expiredAt ? new Date(jadibot[num].expiredAt).toLocaleString("id-ID") : "∞"

        await conn.reply(m.chat, `✅ Berhasil menyambungkan ulang sesi ${num}!\n\n🤖 Bot ID: ${child.user?.id}\n📅 Masa aktif hingga: ${expText}\n\n_Bot sudah aktif dan siap digunakan_`, m)

        if (child?.ev && connectionListener) {
          child.ev.off("connection.update", connectionListener)
        }
      }
    }

    child.ev.on("connection.update", connectionListener)

    await conn.reply(m.chat, `⏳ Menunggu koneksi untuk sesi ${num}...\n\n_Jika tidak tersambung dalam 30 detik, coba jalankan command ini lagi atau gunakan:_\n*${usedPrefix}jadibot ${num}*`, m)
  } catch (e) {
    if (child?.ev && connectionListener) {
      try {
        child.ev.off("connection.update", connectionListener)
      } catch {}
    }

    const sc = e?.output?.statusCode || e?.data?.statusCode
    await conn.reply(m.chat, `❌ Gagal menyambungkan sesi ${num}${sc ? ` (HTTP ${sc})` : ""}:\n\n${e?.message || e}\n\n_Coba daftar ulang dengan:_\n*${usedPrefix}jadibot ${num}*`, m)

    console.error("Reconnect error:", e)

    try {
      await stopChild(num, "stopped")
    } catch {}
  }
}

handler.help = ["reconnect"]
handler.tags = ["jadibot"]
handler.command = /^(reconnect|reconnectbot|reconnectjadibot)$/i
handler.botUtama = true

export default handler
