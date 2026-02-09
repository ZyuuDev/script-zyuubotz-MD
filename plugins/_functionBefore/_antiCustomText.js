export async function before(m, { conn, isAdmin, isBotAdmin, senderKey }) {
  if (!/lid|@s.whatsapp.net/.test(senderKey)) return
  if (!m.isGroup || isAdmin || m.fromMe) return
  if (!conn.customText) conn.customText = {}
  let chat = global.db.data.chats[m.chat]
  let text = m.text.toLowerCase()
  for (let i = 0; i < chat.customText.length; i++) {
    let customText = new RegExp(chat.customText[i].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
    if (customText.test(text)) {
      if (!chat.antiCustomText || conn.customText[senderKey]) continue
      conn.customText[senderKey] = true
      if (chat.teks) {
        conn.readAndComposing(m)
        await m.reply(`_*乂 Pesan ${chat.customText[i]} Terdeteksi!*_ ${chat.pembatasan ? "\n_pesan kamu akan di hapus!_" : "\n_pesan kamu akan dihapus dan kamu akan dikick!_"} ${isBotAdmin ? "" : "\n\n_❬Bot Bukan Admin❭_"}`)
      }
      if (isBotAdmin && !chat.pembatasan) {
        await conn.sendMessage(m.chat, { delete: m.key })
        await conn.groupParticipantsUpdate(m.chat, [senderKey], "remove")
      } else if (chat.pembatasan && isBotAdmin) {
        await conn.sendMessage(m.chat, { delete: m.key })
      }
    }
  }
  if (conn.customText[senderKey]) delete conn.customText[senderKey]
}
