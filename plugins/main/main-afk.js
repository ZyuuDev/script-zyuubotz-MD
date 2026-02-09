const linkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i

const handler = async (m, { senderKey, text: txt }) => {
  const user = global.db.data.users[senderKey]
  const chat = global.db.data.chats?.[m.chat]
  user.afk = Date.now()
  const isGroupLink = linkRegex.test(txt)
  const text = chat?.antiLinkGc && isGroupLink ? "KAMU TERDETEKSI MENGIRIM LINK" : txt
  user.afkReason = text
  m.reply(`${user.registered ? user.name : await conn.getName(senderKey)} is now AFK

Reason: ${text ? text : "Tanpa Alasan"}`)
}
handler.help = ["afk"]
handler.tags = ["main"]
handler.command = /^afk$/i

export default handler
