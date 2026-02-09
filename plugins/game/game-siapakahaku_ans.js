import similarity from "similarity"
const threshold = 0.72
export async function before(m, { conn, senderKey }) {
  let id = m.chat
  if (m.fromMe) return
  if (!m.quoted || !m.quoted.fromMe || !m.text || !/Ketik.*(who|hint)|ᴋᴇᴛɪᴋ.*(ᴡʜᴏ|ʜɪɴᴛ)/i.test(m.quoted.text) || /.*(who|hint)|.*(ᴡʜᴏ|ʜɪɴᴛ)/i.test(m.text)) return !0
  conn.siapakahaku = conn.siapakahaku ? conn.siapakahaku : {}
  conn.readAndComposing(m)
  if (!(id in conn.siapakahaku)) return m.reply("Soal itu telah berakhir")
  if (m.quoted.id == conn.siapakahaku[id][0].id) {
    let json = JSON.parse(JSON.stringify(conn.siapakahaku[id][1]))
    if (m.text.toLowerCase() == json.jawaban.toLowerCase().trim()) {
      global.db.data.users[senderKey].exp += conn.siapakahaku[id][2]
      m.reply(`*Benar!*\n+${conn.siapakahaku[id][2]} XP`)
      clearTimeout(conn.siapakahaku[id][4])
      delete conn.siapakahaku[id]
    } else if (similarity(m.text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) {
      m.reply(`*Dikit Lagi!*`)
    } else if (--conn.siapakahaku[id][3] == 0) {
      clearTimeout(conn.siapakahaku[id][4])
      delete conn.siapakahaku[id]
      conn.reply(m.chat, `*Kesempatan habis!*\nJawaban: *${json.jawaban}*`, m)
    } else m.reply(`*Jawaban Salah!*\nMasih ada ${conn.siapakahaku[id][3]} kesempatan`)
  }
  return !0
}
export const exp = 0
