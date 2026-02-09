import { canon } from "../../lib/jadibot.js"

let handler = async (m, { conn, args, usedPrefix, user, command, senderKey, isMods }) => {
  const days = parseInt(args[0]?.replace(/[^0-9]/g, "")) || 0
  let num = canon(args[1] || "")

  if (days < 1) {
    return conn.reply(m.chat, `❌ Jumlah hari tidak valid.\n\nContoh penggunaan:\n*${usedPrefix}${command} 10hari*\natau\n*${usedPrefix}${command} 10 62xxxxxxxxxx*`, m)
  }

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
          const name = await conn.getName(v + "@s.whatsapp.net")
          const status = jadibot[v].aktif ? "✅ Aktif" : "❌ Tidak Aktif"
          const expired = jadibot[v].expiredAt ? new Date(jadibot[v].expiredAt).toLocaleString("id-ID") : "∞"

          const isExpired = jadibot[v].expiredAt && Date.now() >= jadibot[v].expiredAt
          const expiredTag = isExpired ? " (⏰ Expired)" : ""

          return [`${usedPrefix}${command} ${days} ${v}`, (i + 1).toString(), `${name}\n📞 ${v}\n${status}\n📅 Expired: ${expired}${expiredTag}`]
        })
      )
      return await conn.textList(m.chat, `Pilih jadibot yang ingin diperpanjang ${days} hari:`, false, list, m)
    } else if (keys.length === 1) {
      num = keys[0]
    }
  }

  if (!num) {
    return conn.reply(m.chat, `❌ Nomor tidak valid.\n\nContoh:\n*${usedPrefix}${command} ${days}hari 62xxxxxxxxxx*`, m)
  }

  if (!jadibot[num]) {
    return conn.reply(m.chat, `❌ Sesi ${num} tidak ditemukan di database.\n\n_Daftar terlebih dahulu dengan:_\n*${usedPrefix}jadibot ${num}*`, m)
  }

  if (!isMods && jadibot[num].owner !== senderKey) {
    return conn.reply(m.chat, `❌ Kamu bukan owner dari jadibot ${num}`, m)
  }

  if (!user.limitjb || user.limitjb < days) {
    return conn.reply(m.chat, `❌ Limit jadibot kamu tidak mencukupi.\n\n📊 Limit kamu: ${user.limitjb || 0} JB\n📅 Dibutuhkan: ${days} JB\n\n_Beli limit dengan:_\n*${usedPrefix}buylimitjb ${days}d*`, m)
  }

  const currentExpiry = jadibot[num].expiredAt || 0
  const now = Date.now()
  const isExpired = currentExpiry && now >= currentExpiry

  let newExpiry
  if (!currentExpiry || isExpired) {
    newExpiry = now + days * 86400000
  } else {
    newExpiry = currentExpiry + days * 86400000
  }

  const oldExpDate = currentExpiry ? new Date(currentExpiry).toLocaleString("id-ID") : "Belum diset"
  const newExpDate = new Date(newExpiry).toLocaleString("id-ID")
  const expiredStatus = isExpired ? " (⏰ Expired)" : ""

  user.limitjb -= days

  jadibot[num].expiredAt = newExpiry
  jadibot[num].lastExtendedAt = now
  jadibot[num].lastExtendedBy = senderKey

  if (isExpired) {
    jadibot[num].aktif = false
  }

  const msg = `✅ *Berhasil Memperpanjang Jadibot*

📱 Nomor: ${num}
⏱️ Diperpanjang: ${days} hari
💰 Limit terpakai: ${days} JB
📊 Sisa limit: ${user.limitjb} JB

📅 *Masa Aktif:*
• Sebelumnya: ${oldExpDate}${expiredStatus}
• Sekarang: ${newExpDate}

${isExpired ? "\n⚠️ _Bot sebelumnya sudah expired. Gunakan command berikut untuk reconnect:_\n*" + usedPrefix + "reconnect " + num + "*" : "\n✅ _Bot masih aktif dan siap digunakan_"}`

  await conn.reply(m.chat, msg, m)
}

handler.help = ["perpanjangbot <hari> [nomor]"]
handler.tags = ["jadibot"]
handler.command = /^(perpanjangbot|perpanjangjadibot|extendbot)$/i
handler.botUtama = true

export default handler
