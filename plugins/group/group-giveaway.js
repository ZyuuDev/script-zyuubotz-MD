let handler = async (m, { usedPrefix, text, command, participants, isAdmin, senderKey }) => {
  conn.giveway = conn.giveway ? conn.giveway : {}
  let id = m.chat
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || q.mediaType || ""
  text = text ? text : m.quoted && m.quoted.text ? m.quoted.text : m.quoted && m.quoted.caption ? m.quoted.caption : m.quoted && m.quoted.description ? m.quoted.description : ""
  let d = new Date()
  let date = d.toLocaleDateString("id", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  switch (command) {
    case "mulaigiveaway": {
      if (!isAdmin) return global.dfail("admin", m, conn)
      if (!text) return m.reply(`Gunakan Format Yang Benar \n\nContoh : ${usedPrefix + command} Uang 10 Juta`)
      if (id in conn.giveway) return m.reply(`_*Masih ada GIVEAWAY di chat ini!*_`)
      let capt = `Berhasil memulai giveaway!\n\n*${usedPrefix}ikut* - untuk ikut giveaway\n*${usedPrefix}cekgiveaway* - untuk cek yang ikut\n*${usedPrefix}rollgiveaway* - untuk mencari pemenang\n*${usedPrefix}deletegiveaway* - untuk hapus giveaway\n\n*INFORMASI:*\n\n${text}`
      conn.giveway[id] = [m.reply(capt, false, { mentions: participants.map((a) => a.id) }), [], text]
      break
    }
    case "rollgiveaway": {
      if (!isAdmin) return global.dfail("admin", m, conn)
      if (!(id in conn.giveway)) return m.reply(`_*Tidak ada GIVEAWAY berlangsung digrup ini!*_\n\n*${usedPrefix}mulaigiveaway* - untuk memulai giveaway`)
      let absen = conn.giveway[id][1]
      if (absen.length <= 1) return m.reply("Minimal 2 orang untuk bisa roll")
      let cita = absen[Math.floor(Math.random() * absen.length)]
      let tag = `@${cita.split`@`[0]}`
      let loadd = ["■□ 10%", "□■ 20%", "■□ 30%", "□■ 40%", "■□ 50%", "□■ 60%", "■□ 70%", "□■ 80%", "■□ 90%", "*Mendapatkan Pemenangnya*"]
      let { key } = await m.reply("*Mencari Pemenangnya...*")
      for (let i = 0; i < loadd.length; i++) {
        await sleep(1000)
        await conn.sendMessage(m.chat, { text: loadd[i], edit: key })
      }
      await conn.reply(
        m.chat,
        `🎊 *CONGRATULATIONS* 🎉
${tag} Kamu Pemenang Giveawaynya🎉

Tanggal: ${date}
————————————————————————
_*Note:* Hapus giveaway setelah selesai dengan menulis *.hapusgiveaway*_`,
        m,
        { contextInfo: { mentionedJid: absen } }
      )
      break
    }
    case "cekgiveaway": {
      if (!(id in conn.giveway)) return m.reply(`_*Tidak ada GIVEAWAY berlangsung digrup ini!*_\n\n*${usedPrefix}mulaigiveaway* - untuk memulai giveaway`)
      let absen = conn.giveway[id][1]
      let list = absen.map((v, i) => `│ ${i + 1}. @${v.split`@`[0]}`).join("\n")
      conn.reply(
        m.chat,
        `*「 LIST MEMBER 」*

Tanggal: ${date}
${conn.giveway[id][2]}

┌ *Yang sudah ikut:*
│ 
│ Total: ${absen.length}
${list}
│ 
└────`,
        m,
        { contextInfo: { mentionedJid: absen } }
      )
      break
    }
    case "hapusgiveaway": {
      if (!isAdmin) return global.dfail("admin", m, conn)
      if (!(id in conn.giveway)) return m.reply(`_*Tidak ada GIVEAWAY berlangsung digrup ini!*_\n\n*${usedPrefix}mulaigiveaway* - untuk memulai giveaway`)
      delete conn.giveway[id]
      conn.sendMessage(m.chat, { text: "*GIVEAWAY* telah selesai", mentions: participants.map((a) => a.id) })
      break
    }
    case "ikut":
    case "ikutgiveaway": {
      if (!(id in conn.giveway)) return m.reply(`_*Tidak ada GIVEAWAY berlangsung digrup ini!*_\n\n*${usedPrefix}mulaigiveaway* - untuk memulai giveaway`)
      let absen = conn.giveway[id][1]
      const wasVote = absen.includes(senderKey)
      if (wasVote) return m.reply("*Kamu sudah ikut!*")
      absen.push(senderKey)
      await m.reply(`*Done!*\n\n\`\`\`Total yang sudah ikut GIVEWAY sebanyak\`\`\`\n*${absen.length} Anggota*`)
      break
    }
    default:
      let capt = `Untuk memulai silahkan ketik format berikut!\n\n*${usedPrefix}ikut* - untuk ikut giveaway\n*${usedPrefix}cekgiveaway* - untuk cek yang ikut\n*${usedPrefix}rollgiveaway* - untuk mencari pemenang\n*${usedPrefix}deletegiveaway* - untuk hapus giveaway`
      m.reply(capt)
  }
}
handler.help = ["mulaigiveaway", "hapusgiveaway", "ikutgiveaway", "rollgiveaway", "cekgiveaway"]
handler.tags = ["group"]
handler.command = /^((mulai|hapus|ikut|roll|cek)giveaway|ikut|giveaway)$/i
handler.group = true
export default handler

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
