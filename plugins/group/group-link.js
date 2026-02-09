let handler = async (m, { conn, args, isBotAdmin }) => {
  let group = m.chat
  if (/^[0-9]{5,16}-?[0-9]+@g\.us$/.test(args[0])) group = args[0]
  if (!/^[0-9]{5,16}-?[0-9]+@g\.us$/.test(group)) return m.reply("Hanya bisa dibuka di grup")
  let groupMetadata = await conn.groupMetadata(group)
  if (!groupMetadata) return m.reply("groupMetadata is undefined :\\")
  if (!("participants" in groupMetadata)) return m.reply("participants is not defined :(")
  let bot = groupMetadata.participants.find((user) => {
    const userId = conn.decodeJid(user.phoneNumber || user.id)
    return userId === conn.decodeJid(userId.endsWith("@s.whatsapp.net") ? conn.user.jid : conn.user.lid)
  })
  if (!bot) return m.reply("Aku tidak ada di grup itu :(")
  if (!bot.admin) return m.reply("Aku bukan admin T_T")
  m.reply("https://chat.whatsapp.com/" + (await conn.groupInviteCode(group)))
}
handler.help = ["linkgroup"]
handler.tags = ["group"]
handler.command = /^link(gro?up|gc)?$/i

export default handler
