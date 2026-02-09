const handler = async (m, { conn }) => {
  const setting = global.db.data.settings[conn.user.jid]
  if (!setting.self) return m.reply("Bot sudah dalam mode public")
  setting.self = false
  m.reply("Bot sekarang dalam mode public")
}
handler.help = ["public"]
handler.tags = ["owner"]
handler.command = /^(public)$/i
handler.owner = true
export default handler
