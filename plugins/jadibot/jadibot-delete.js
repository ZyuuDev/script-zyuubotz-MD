import { stopChild, canon, digit, getChildByNumber } from "../../lib/jadibot.js"

let handler = async (m, { conn, text, usedPrefix, command, senderKey, isMods, user }) => {
  let num = canon(text || "")

  const bot = global.db.data.bots
  if (!bot.jadibot) bot.jadibot = {}

  const jadibot = bot.jadibot

  if (!num) {
    const keys = Object.keys(jadibot).filter((v) => {
      return isMods || jadibot[v].owner === senderKey
    })

    if (keys.length === 0) {
      return conn.reply(m.chat, `❌ Tidak ada sesi jadibot yang ${isMods ? "terdaftar" : "kamu miliki"}.\n\n_Tidak ada yang bisa dihapus_`, m)
    }

    if (keys.length > 1) {
      const list = await Promise.all(
        keys.map(async (v, i) => {
          const name = await conn.getName(v + "@s.whatsapp.net")
          const status = jadibot[v].aktif ? "✅ Aktif" : "❌ Tidak Aktif"
          const expired = jadibot[v].expiredAt ? new Date(jadibot[v].expiredAt).toLocaleString("id-ID") : "∞"

          const child = getChildByNumber(v)
          const connStatus = child?.user?.id ? " (🔗 Connected)" : ""

          return [`${usedPrefix}${command} ${v}`, (i + 1).toString(), `${name}\n📞 ${v}\n${status}${connStatus}\n📅 Expired: ${expired}`]
        })
      )
      return await conn.textList(m.chat, `⚠️ *Pilih jadibot yang ingin DIHAPUS PERMANEN:*\n\n_Session dan semua data akan dihapus!_`, false, list, m)
    } else if (keys.length === 1) {
      num = keys[0]
    }
  }

  if (!num) {
    return conn.reply(m.chat, `❌ Nomor tidak valid.\n\nContoh:\n*${usedPrefix}${command} 62xxxxxxxxxx*`, m)
  }

  if (!jadibot[num]) {
    return conn.reply(m.chat, `❌ Sesi ${num} tidak ditemukan di database.\n\n_Tidak ada yang perlu dihapus_`, m)
  }

  if (!isMods && jadibot[num].owner !== senderKey) {
    return conn.reply(m.chat, `❌ Kamu bukan owner dari jadibot ${num}`, m)
  }

  const child = getChildByNumber(num)
  const botId = child?.user?.id || jadibot[num]?.jid || num

  const now = Date.now()
  const expiredAt = jadibot[num].expiredAt || 0
  let refundDays = 0
  let refundMessage = ""

  if (expiredAt && expiredAt > now) {
    const msLeft = expiredAt - now
    const daysLeft = Math.floor(msLeft / 86400000)
    const hoursLeft = Math.floor((msLeft % 86400000) / 3600000)

    refundDays = hoursLeft >= 12 ? daysLeft + 1 : daysLeft

    if (refundDays > 0) {
      if (!user.limitjb) user.limitjb = 0
      user.limitjb += refundDays

      refundMessage = `\n💰 *Pengembalian Limit:*\n• Sisa waktu: ${daysLeft}d ${hoursLeft}h\n• Limit dikembalikan: ${refundDays} JB\n• Total limit sekarang: ${user.limitjb} JB\n`
    }
  }

  await conn.reply(m.chat, `⏳ Menghapus sessions jadibot ${num}...\n\n_Mohon tunggu, proses ini akan:_\n• Memutus koneksi bot\n• Menghapus file session\n• Menghapus data dari database${refundDays > 0 ? "\n• Mengembalikan sisa limit" : ""}`, m)

  try {
    await stopChild(num, "deleted")

    await conn.reply(
      m.chat,
      `✅ *Berhasil Menghapus Jadibot*

📱 Nomor: ${num}
🤖 Bot ID: ${botId}

✓ Koneksi diputus
✓ Session files dihapus
✓ Data dihapus dari database
${refundMessage}
_Terimakasih sudah menggunakan layanan jadibot_

${isMods ? "" : "\n_Untuk membuat jadibot baru gunakan:_\n*" + usedPrefix + "jadibot 62xxxxxxxxxx*"}`,
      m
    )
  } catch (e) {
    console.error("Error deleting bot:", e)

    try {
      if (jadibot[num]) {
        delete jadibot[num]
      }
    } catch {}

    await conn.reply(m.chat, `⚠️ Terjadi error saat menghapus jadibot ${num}:\n\n${e?.message || e}\n\n_Namun data sudah dihapus dari database. Jika session file masih ada, akan otomatis terhapus saat restart._`, m)
  }
}

handler.help = ["deletebot [nomor]"]
handler.tags = ["jadibot"]
handler.command = /^((del|delete|hapus)(bot|jadibot|session))$/i
handler.botUtama = true

export default handler
