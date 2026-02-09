export async function before(m, { conn, isBotAdmin, senderKey }) {
  if (!/lid|@s.whatsapp.net/.test(senderKey)) return
  if (!m.fromMe || !m.isGroup) return
  let chat = global.db.data.chats[m.chat]

  if (m.id.startsWith("BAE5") || m.id.startsWith("3EB0")) {
    if (chat.antiBot) {
      if (isBotAdmin) {
        conn.readAndComposing(m)
        await m.reply("Kamu Terdeteksi BOT! Kamu Akan Dikick!")
        await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.key.participant } })
        await conn.groupParticipantsUpdate(m.chat, [senderKey], "remove")
      } else {
        m.reply("Kamu Terdeksi BOT! \n\n_BOT Bukan Admin!_")
      }
    }
  }
}
