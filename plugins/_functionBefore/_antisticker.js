export async function before(m, { isAdmin, isBotAdmin, conn, senderKey }) {
  if (!/lid|@s.whatsapp.net/.test(senderKey)) return
  if (m.fromMe || !m.isGroup) return
  let chat = global.db.data.chats[m.chat]
  let isSticker = m.mtype
  if (chat.antiSticker && isSticker === "stickerMessage") {
    if (!isAdmin || isBotAdmin) {
      await conn.sendMessage(m.chat, { delete: m.key })
    }
  }
  return !0
}
