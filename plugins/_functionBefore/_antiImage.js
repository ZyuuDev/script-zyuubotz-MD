export async function before(m, { conn, senderKey }) {
  if (!/lid|@s.whatsapp.net/.test(senderKey)) return
  if (!m.isGroup) return !0
  const chat = global.db.data.chats[m.chat]
  if (chat.antiImage) {
    if (/image/.test(m.mtype)) {
      await conn.sendMessage(m.chat, { delete: m.key })
    }
  }
  return !0
}
