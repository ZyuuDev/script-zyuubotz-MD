export async function before(m, { isBotAdmin, senderKey, conn }) {
  if (!/lid|@s.whatsapp.net/.test(senderKey)) return
  if (m.fromMe || !m.isGroup) return
  const chat = global.db.data.chats[m.chat]
  const isForwarded = m.mtype === "groupStatusMentionMessage" || (m.quoted && m.quoted.mtype === "groupStatusMentionMessage") || (m.message && m.message.groupStatusMentionMessage) || (m.message && m.message.protocolMessage && m.message.protocolMessage.type === 25)
  if (isForwarded) {
    if (chat.antiTagSW && m.isGroup) {
      if (chat.teks) {
        conn.readAndComposing(m)
        await m.reply(`_*乂 Pesan Tag Terdeteksi!*_ ${chat.pembatasan ? "\n_pesan kamu akan di hapus!_" : "\n_pesan kamu akan dihapus dan kamu akan dikick!_"} ${isBotAdmin ? "" : "\n\n_❬Bot Bukan Admin❭_"}`)
      }
      if (isBotAdmin && !chat.pembatasan) {
        await conn.sendMessage(m.chat, { delete: m.key })
        await conn.groupParticipantsUpdate(m.chat, [senderKey], "remove")
      } else if (chat.pembatasan && isBotAdmin) {
        await conn.sendMessage(m.chat, { delete: m.key })
      }
    }
  }
}
