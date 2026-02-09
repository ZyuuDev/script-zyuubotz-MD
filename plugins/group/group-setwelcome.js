let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (text) {
    let chat = global.db.data.chats[m.chat]
    if (!chat.welcome) return m.reply(`Silahkan hidupkan dulu welcome dengan command *${usedPrefix}enable welcome*`)
    chat.sWelcome = text
    m.reply("Welcome berhasil diatur\n@user (Mention)\n@subject (Judul Grup)\n@desc (Deskripsi Grup)")
  } else return m.reply(`Teksnya mana?\n\ncontoh:\n${usedPrefix + command} hai, @user!\nSelamat datang di grup @subject\n\n@desc`)
}
handler.help = ["setwelcome"]
handler.tags = ["group"]
handler.command = /^(setwelcome|setw)$/i
handler.group = true
handler.admin = true

export default handler
