let linkRegex = /anj(k|g)|ajn?(g|k)|a?njin(g|k)|bajingan|b(a?n)?gsa?t|ko?nto?l|me?me?(k|q)|pe?pe?(k|q)|meki|titi(t|d)|pe?ler|tetek|toket|ngewe|go?blo?k|to?lo?l|idiot|(k|ng)e?nto?(t|d)|jembut|bego|dajj?al|janc(u|o)k|pantek|puki ?(mak)?|kimak|kampang|lonte|col(i|mek?)|pelacur|henceu?t|nigga|fuck|dick|bitch|tits|bastard|asshole/i // tambahin sendiri
export async function before(m, { conn, senderKey }) {
  if (!/lid|@s.whatsapp.net/.test(senderKey)) return
  if (m.fromMe || !m.isGroup) return
  let chat = global.db.data.chats[m.chat]

  let isGroupToxic = linkRegex.exec(m.text)
  if (chat.antiToxic && isGroupToxic) {
    conn.readAndComposing(m)
    await m.reply("Ｊａｎｇａｎ Ｔｏｘｉｃ ｙａ！！")
  }
  return !0
}
