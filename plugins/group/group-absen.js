let handler = async (m, { conn, usedPrefix, command, text, isAdmin, senderKey }) => {
  let id = m.chat
  let data = global.db.data.bots.absen[id]

  if (!data) {
    global.db.data.bots.absen[id] = {}
    data = global.db.data.bots.absen[id]
  }

  switch (text) {
    case "start": {
      if (!isAdmin) return global.dfail("admin", m, conn)
      if (data.tanggal) return m.reply(`_*Masih ada absen di chat ini!*_\n\n*${usedPrefix + command} delete* - untuk menghapus absen`)
      m.reply("Done!")
      data.tanggal = new Date() * 1
      data.absen = []
      data.close = false
      break
    }
    case "close": {
      if (!isAdmin) return global.dfail("admin", m, conn)
      if (!data.tanggal) return m.reply(`_*Tidak ada absen di group ini!*_\n\n*${usedPrefix + command} start* - untuk memulai absen`)
      if (data.close) return m.reply("Absen telah ditutup")
      m.reply("Done!")
      data.close = true
      break
    }
    case "delete": {
      if (!isAdmin) return global.dfail("admin", m, conn)
      if (!data.tanggal) return m.reply(`_*Tidak ada absen di group ini!*_\n\n*${usedPrefix + command} start* - untuk memulai absen`)
      m.reply("Done!")
      delete global.db.data.bots.absen[id]
      break
    }
    case "cek": {
      if (!data.tanggal) return m.reply(`_*Tidak ada absen di group ini!*_\n\n*${usedPrefix + command} start* - untuk memulai absen`)
      let d = new Date(data.tanggal)
      let date = d.toLocaleDateString("id", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      let list = data.absen.map((v, i) => `│ ${i + 1}. @${v.split`@`[0]}`).join("\n")
      m.reply(
        `
*「 ABSEN 」${data?.close ? " ( DITUTUP )*" : "*"}

Tanggal: ${date}

┌ *Yang sudah absen:*
│ 
│ Total: ${data.absen.length}
${list}
│ 
└────
`.trim(),
        false,
        { contextInfo: { mentionedJid: data.absen } }
      )
      break
    }
    case "help": {
      m.reply(
        `
Cara Penggunaan:
${usedPrefix + command} start - Untuk memulai Absen
${usedPrefix + command} delete - Untuk menghapus Absen
${usedPrefix + command} cek - Untuk mengecek Absen
${usedPrefix + command} close - Untuk menutup Absen
${usedPrefix + command} - Untuk Absen
`.trim()
      )
      break
    }
    default: {
      if (!data.tanggal) return m.reply(`_*Tidak ada absen di group ini!*_\n\n*${usedPrefix + command} start* - untuk memulai absen`)
      if (!data.close && !data.absen.includes(senderKey)) {
        data.absen.push(senderKey)
        await m.reply("Absen berhasil!")
      } else if (data.close) {
        return m.reply("Absen telah ditutup")
      } else {
        return m.reply("Anda sudah absen")
      }
      let d = new Date(data.tanggal)
      let date = d.toLocaleDateString("id", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      let list = data.absen.map((v, i) => `│ ${i + 1}. @${v.split`@`[0]}`).join("\n")
      await m.reply(
        `
Tanggal: ${date}

┌「 *Absen* 」  
├ Total: ${data.absen.length}
${list} 
└────
Untuk melihat cara penggunaan silahkan ketik
${usedPrefix + command} help
`.trim(),
        false,
        { contextInfo: { mentionedJid: data.absen } }
      )
      break
    }
  }
}

handler.help = ["absen"]
handler.tags = ["group"]
handler.command = /^(absen|hadir)$/i
handler.group = true
export default handler
