import { requestCodeWithRetry, makeChild, restartAfterPair, normalizeMsisdn, canon, getChildByNumber } from "../../lib/jadibot.js"
import { DisconnectReason } from "@whiskeysockets/baileys"

let handler = async (m, { conn, text, usedPrefix, user, senderKey, command, isMods }) => {
  if (/help/i.test(text)) {
    const caption = `
\`\`\`Jadibot Command Help\`\`\`

*Menghubungkan Sesi Jadibot:*
Contoh:
> .jadibot 62895xxxxxxxx

*Menghubungkan ulang sesi Jadibot:*
Contoh:
> .reconnect

*Menghentikan sesi Jadibot:*
Contoh:
> .stopjadibot

*Menghapus sesi Jadibot:*
Contoh:
> .deljadibot

*Memperpanjang sesi Jadibot:*
Contoh:
> .perpanjangbot 5hari
`.trim()
    return conn.reply(m.chat, caption, m)
  }

  const parts = String(text || "")
    .trim()
    .split(/\s+/)
  const msisdn = normalizeMsisdn(parts[0] || "")

  if (!msisdn) {
    return conn.reply(m.chat, `Masukan format yang benar!\n\nContoh:\n${usedPrefix}jadibot 62xxxxxxxxxx\n\nAtau\n${usedPrefix + command} help`, m)
  }

  try {
    const data = await conn.onWhatsApp(msisdn)
    if (!data?.length || !data[0]?.jid) {
      return conn.reply(m.chat, `❌ Nomor ${msisdn} tidak terdaftar di WhatsApp`, m)
    }
  } catch (e) {
    console.error("Error checking WhatsApp registration:", e)
    return conn.reply(m.chat, `❌ Gagal memeriksa nomor WhatsApp: ${e.message}`, m)
  }

  const bot = global.db.data.bots

  const existingChild = getChildByNumber(msisdn)
  const isExistingBot = bot.jadibot?.[msisdn]

  if (isExistingBot) {
    if (!isMods && bot.jadibot[msisdn].owner !== senderKey) {
      return conn.reply(m.chat, `❌ Kamu bukan owner dari jadibot ${msisdn}`, m)
    }

    const now = Date.now()
    const expiredAt = bot.jadibot[msisdn].expiredAt || 0
    if (expiredAt && now >= expiredAt) {
      return conn.reply(m.chat, `❌ Masa aktif jadibot ${msisdn} telah habis.\n\n_Silakan perpanjang terlebih dahulu dengan:_\n*${usedPrefix}perpanjangbot 10hari*`, m)
    }

    if (existingChild?.user?.id) {
      const expText = expiredAt ? new Date(expiredAt).toLocaleString("id-ID") : "∞"
      return conn.reply(m.chat, `✅ Bot ${msisdn} sudah aktif dan terhubung sebagai ${existingChild.user.id}\n\n📅 Masa aktif hingga: ${expText}\n\n_Gunakan .reconnect untuk menghubungkan ulang jika ada masalah_`, m)
    }

    await conn.reply(m.chat, `🔄 Bot ${msisdn} ditemukan di database.\n⏳ Menghubungkan ulang...`, m)
  } else {
    if (!user.limitjb || user.limitjb < 1) {
      return conn.reply(m.chat, `❌ Limit jadibot kamu habis.\n\nSilahkan beli terlebih dahulu dengan command:\n*${usedPrefix}buylimitjb 10d*`, m)
    }
  }

  await conn.reply(m.chat, `⏳ Menyiapkan sesi untuk ${msisdn}...\nMohon tunggu...`, m)

  let child
  let connectionListener

  try {
    child = await makeChild(msisdn, true, senderKey)

    if (child?.__already || child?.user?.id) {
      if (isExistingBot) {
        bot.jadibot[msisdn].aktif = true
        bot.jadibot[msisdn].lastConnectedAt = Date.now()

        const expText = bot.jadibot[msisdn].expiredAt ? new Date(bot.jadibot[msisdn].expiredAt).toLocaleString("id-ID") : "∞"

        return conn.reply(m.chat, `✅ Sesi ${canon(msisdn)} berhasil tersambung kembali!\n\n🤖 Bot ID: ${child.user?.id}\n📅 Masa aktif hingga: ${expText}\n\n_Bot sudah aktif dan siap digunakan_`, m)
      } else {
        const expired = Date.now() + 86400000
        bot.jadibot[msisdn] = {
          expiredAt: expired,
          owner: senderKey,
          aktif: true,
          connectedAt: Date.now(),
        }

        user.limitjb -= 1

        return conn.reply(m.chat, `✅ Sesi ${canon(msisdn)} berhasil terdaftar dan tersambung!\n\n🤖 Bot ID: ${child.user?.id}\n📅 Masa aktif hingga: ${new Date(expired).toLocaleString("id-ID")}\n📊 Sisa limit: ${user.limitjb} JB\n\n_Bot sudah aktif dan siap digunakan_`, m)
      }
    }

    let waitingPairAck = false

    connectionListener = async ({ connection, lastDisconnect }) => {
      if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.statusCode
        const isLoggedOut = code === DisconnectReason.loggedOut

        if (!isLoggedOut && (code === 515 || code === 410 || waitingPairAck)) {
          waitingPairAck = false

          if (child?.ev && connectionListener) {
            child.ev.off("connection.update", connectionListener)
          }

          await restartAfterPair({
            msisdn,
            m,
            conn,
            why: `code ${code || "stream closed"}`,
            code: code || "stream closed",
          })
        }
      }
    }

    child.ev.on("connection.update", connectionListener)

    const code = await requestCodeWithRetry(child, msisdn, 5)
    const expired = Date.now() + 86400000
    waitingPairAck = true

    const msg = `🔐 *Pairing Code untuk ${canon(msisdn)}*

Masukkan kode ini di WhatsApp yang ingin dijadikan bot:

*KODE: \`${code}\`*

📱 *Cara memasukkan:*
1. Buka WhatsApp
2. Ketuk ⋮ (titik tiga) > *Perangkat Tertaut*
3. Ketuk *Tautkan dengan Nomor Telepon*
4. Masukkan kode di atas

⏰ Masa aktif hingga: ${new Date(expired).toLocaleString("id-ID")}

_Setelah berhasil, bot akan restart otomatis dan mengirim notifikasi_`

    await conn.reply(m.chat, msg, m, false, { smlcap: true, except: [code] })

    if (isExistingBot) {
      bot.jadibot[msisdn].aktif = true
      bot.jadibot[msisdn].lastPairingAt = Date.now()
    } else {
      bot.jadibot[msisdn] = {
        expiredAt: expired,
        owner: senderKey,
        aktif: true,
        connectedAt: Date.now(),
      }

      user.limitjb -= 1
      await conn.reply(m.chat, `✅ Berhasil menggunakan 1 limit jadibot\n📊 Sisa limit: ${user.limitjb} JB`, m)
    }
  } catch (e) {
    if (child?.ev && connectionListener) {
      try {
        child.ev.off("connection.update", connectionListener)
      } catch {}
    }

    if (!isExistingBot && bot.jadibot?.[msisdn]) {
      delete bot.jadibot[msisdn]
    }

    const sc = e?.output?.statusCode || e?.data?.statusCode
    await conn.reply(m.chat, `❌ Gagal mendapatkan pairing code${sc ? ` (HTTP ${sc})` : ""}:\n\n${e?.message || e}`, m)

    console.error("Jadibot error:", e)
  }
}

handler.help = ["jadibot"]
handler.tags = ["jadibot"]
handler.command = /^jadibot$/i
handler.botUtama = true

export default handler
