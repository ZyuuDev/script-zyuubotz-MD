import similarity from "similarity"
const threshold = 0.72
export async function before(m, { conn, senderKey }) {
  let id = m.chat
  if (m.fromMe) return
  if (!m.quoted || !m.quoted.fromMe || !m.text || !/Ketik.*teben|ᴋᴇᴛɪᴋ.*ᴛᴇʙᴇɴ/i.test(m.quoted.text) || /.*teben|.*ᴛᴇʙᴇɴ/i.test(m.text)) return !0
  conn.tebakbendera = conn.tebakbendera ? conn.tebakbendera : {}
  conn.readAndComposing(m)
  if (!(id in conn.tebakbendera)) return m.reply("Soal itu telah berakhir")
  if (m.quoted.id == conn.tebakbendera[id][0].id) {
    let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text)
    if (isSurrender) {
      clearTimeout(conn.tebakbendera[id][4])
      delete conn.tebakbendera[id]
      return m.reply("*Yah Menyerah :( !*")
    }
    let json = JSON.parse(JSON.stringify(conn.tebakbendera[id][1]))
    if (m.text.toLowerCase() == json.name.toLowerCase().trim()) {
      global.db.data.users[senderKey].exp += conn.tebakbendera[id][2]
      m.reply(`*Benar!*\n+${conn.tebakbendera[id][2]} XP`)
      clearTimeout(conn.tebakbendera[id][4])
      delete conn.tebakbendera[id]
    } else if (similarity(m.text.toLowerCase(), json.name.toLowerCase().trim()) >= threshold) {
      m.reply(`*Dikit Lagi!*`)
    } else if (--conn.tebakbendera[id][3] == 0) {
      clearTimeout(conn.tebakbendera[id][4])
      delete conn.tebakbendera[id]
      conn.reply(m.chat, `*Kesempatan habis!*\nJawaban: *${json.jawaban}*`, m)
    } else m.reply(`*Jawaban Salah!*\nMasih ada ${conn.tebakbendera[id][3]} kesempatan`)
  }
  return !0
}
export const exp = 0
