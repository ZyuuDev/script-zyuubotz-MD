export async function before(m, { conn, senderKey }) {
  if (!/lid|@s.whatsapp.net/.test(senderKey)) return
  if (!m.isGroup || m.fromMe) return
  let chat = global.db.data.chats[m.chat]
  if (!chat.viewOnce && (m.mtype == "viewOnceMessageV2" || m.mtype.hasOwnProperty("viewOnce"))) {
    let buffer = await m.download()
    let caption = m.message.viewOnce || m.viewOnce || ""

    if (caption.toLowerCase().includes("x")) {
      return m.reply("Not allowed by user")
    }

    conn.readAndComposing(m)

    await conn.sendFile(m.chat, buffer, null, caption, m)
  }
  return !0
}
