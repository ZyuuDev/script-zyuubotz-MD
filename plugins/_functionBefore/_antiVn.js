export async function before(m, { conn, isAdmin, isBotAdmin, senderKey }) {
  if (!/lid|@s.whatsapp.net/.test(senderKey)) return
  if (m.fromMe || !m.isGroup) return
  let isVn = m.mtype
  let chat = global.db.data.chats[m.chat]
  if (chat.antiVn) {
    if (/opus/i.test(isVn)) {
      if (!isAdmin || isBotAdmin) {
        conn.sendMessage(m.chat, { delete: m.key })
      }
    }
  }
  return !0
}
