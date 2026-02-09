export async function before(m, { conn, senderKey }) {
  if (!/lid|@s.whatsapp.net/.test(senderKey)) return
  let chat = global.db.data.chats[m.chat]
  let user = global.db.data.users[senderKey]

  if (!user) return
  if (!chat) return

  if (m.fromMe || !m.isGroup || chat.isBanned || chat.mute || user.banned) return
  if (typeof chat.store[m.text] !== "undefined") {
    let { media, caption } = chat.store[m.text]
    conn.readAndComposing(m)

    if (media) {
      await conn.sendFile(m.chat, media, false, caption, m, false, false, { smlcap: false })
    } else {
      await conn.reply(m.chat, caption, m, false, { smlcap: false })
    }
  }
  return !0
}
