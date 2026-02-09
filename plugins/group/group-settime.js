const regex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) {
    return m.reply(`Masukkan Waktu (Format 24 Jam)!\n\nContoh:\n${usedPrefix + command} 23:00`)
  }

  if (!regex.test(text) && !/reset|delete/i.test(text)) {
    return m.reply(`Format Waktu Salah!\n\nContoh:\n${usedPrefix + command} 23:00`)
  }

  let footer = `\n\n_Untuk menghapus waktu tutup dan buka grup ketik_ *${usedPrefix + command} reset*`
  let chat = global.db.data.chats[m.chat]

  switch (command) {
    case "closetime": {
      if (/reset|delete/i.test(text)) {
        chat.closetime = ""
        return m.reply(`Berhasil Menghapus Waktu Tutup Grup!`)
      }
      if (chat.opentime === text) {
        return m.reply("Waktu buka dan tutup grup tidak boleh sama")
      }
      chat.closetime = text
      return m.reply(`Berhasil Mengatur Waktu Tutup Grup!\n\nWaktu Tutup Grup: ${text} ${footer}`)
    }
    case "opentime": {
      if (/reset|delete/i.test(text)) {
        chat.opentime = ""
        return m.reply(`Berhasil Menghapus Waktu Buka Grup!`)
      }
      if (chat.closetime === text) {
        return m.reply("Waktu buka dan tutup grup tidak boleh sama")
      }
      chat.opentime = text
      return m.reply(`Berhasil Mengatur Waktu Buka Grup!\n\nWaktu Buka Grup: ${text} ${footer}`)
    }
  }
}

handler.help = ["closetime", "opentime"]
handler.tags = ["group"]
handler.command = /^(closetime|opentime)$/i // Memperbaiki regex command
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
