const handler = async (m, { conn }) => {
  const setting = global.db.data.settings[conn.user.jid]
  if (setting.self) return m.reply("Bot sudah dalam mode self")
  setting.self = true
  m.reply("Bot sekarang dalam mode self")
}
handler.help = ["self"]
handler.tags = ["owner"]
handler.command = /^(self)$/i
handler.owner = true
export default handler
