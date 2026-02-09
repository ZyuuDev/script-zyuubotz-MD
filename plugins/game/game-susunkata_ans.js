import similarity from "similarity"
const threshold = 0.72
export async function before(m, { conn, senderKey }) {
  let id = m.chat
  if (m.fromMe) return
  if (!m.quoted || !m.quoted.fromMe || !/Ketik.*suska|ᴋᴇᴛɪᴋ.*ꜱᴜꜱᴋᴀ/i.test(m.quoted.text)) return !0
  conn.susunkata = conn.susunkata ? conn.susunkata : {}
  conn.readAndComposing(m)
  if (!(id in conn.susunkata)) return m.reply("Soal itu telah berakhir")
  if (m.quoted.id == conn.susunkata[id][0].id) {
    let json = JSON.parse(JSON.stringify(conn.susunkata[id][1]))
    if (m.text.toLowerCase() == json.jawaban.toLowerCase().trim()) {
      global.db.data.users[senderKey].money += conn.susunkata[id][2]
      global.db.data.users[senderKey].limit += 1
      m.reply(`*🎉BENAR!🎉*\n+${conn.susunkata[id][2]} 💰Money\n+1 🎫Limit`)
      clearTimeout(conn.susunkata[id][4])
      delete conn.susunkata[id]
    } else if (similarity(m.text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) {
      m.reply(`*Dikit Lagi!*`)
    } else if (--conn.susunkata[id][3] == 0) {
      clearTimeout(conn.susunkata[id][4])
      delete conn.susunkata[id]
      conn.reply(m.chat, `*Kesempatan habis!*\nJawaban: *${json.jawaban}*`, m)
    } else m.reply(`*Jawaban Salah!*\nMasih ada ${conn.susunkata[id][3]} kesempatan`)
  }
  return !0
}
export const exp = 0
