let handler = async (m, { conn, senderKey }) => {
  conn.reply(senderKey, "https://chat.whatsapp.com/" + (await conn.groupInviteCode(m.chat)), m)
}
handler.help = ["revoke"]
handler.tags = ["group"]
handler.command = /^re(voke|new)(invite|link)?$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
