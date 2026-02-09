let handler = async (m, { conn, command, usedPrefix, text }) => {
  const chat = global.db.data.chats[m.chat]
  switch (command) {
    case "addcustomtext": {
      if (!chat.antiCustomText) return m.reply(`Silahkan hidupkan dulu *anticustomtext* dengan command *${usedPrefix}enable anticustomtext*`)
      if (chat.customText.includes(text)) return m.reply(`Kata ${text} sudah ada di daftar kata yang dilarang!`)
      if (!text) return m.reply(`Masukan kata yang ingin dilarang! \n\nContoh: \n${usedPrefix + command} keren`)
      chat.customText.push(text)
      m.reply(`Berhasil menambahkan kata ${text}`)
      break
    }
    case "delcustomtext": {
      if (!text) return m.reply(`Masukan kata yang ingin dihapus! \n\nContoh: \n${usedPrefix + command} keren`)
      if (!chat.customText.includes(text)) return m.reply(`Kata ${text} tidak ada di daftar kata yang dilarang!`)
      chat.customText = chat.customText.filter((v) => v !== text)
      m.reply(`Berhasil menghapus kata ${text}`)
      break
    }
    case "listcustomtext": {
      let list = chat.customText
        .map((v, i) => {
          return `${i + 1}. ${v}`
        })
        .join("\n")
      m.reply("Daftar kata yang dilarang di Group ini:\n" + list)
    }
  }
}
handler.help = ["addcustomtext", "delcustomtext", "listcustomtext"]
handler.tags = ["group"]
handler.command = /^((add|set)customtext|delcustomtext|listcustomtext)$/i
handler.group = true
handler.admin = true
export default handler
