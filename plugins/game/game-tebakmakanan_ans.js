import similarity from "similarity"
const threshold = 0.72
export async function before(m, { conn, senderKey }) {
  let id = m.chat
  if (m.fromMe) return
  if (!m.quoted || !m.quoted.fromMe || !m.text || !/Ketik.*teman|ᴋᴇᴛɪᴋ.*ᴛᴇᴍᴀɴ/i.test(m.quoted.text) || /.*teman|.*ᴛᴇᴍᴀɴ/i.test(m.text)) return !0
  conn.tebakmakanan = conn.tebakmakanan ? conn.tebakmakanan : {}
  conn.readAndComposing(m)
  if (!(id in conn.tebakmakanan)) return m.reply("Soal itu telah berakhir")
  if (m.quoted.id == conn.tebakmakanan[id][0].id) {
    let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text)
    if (isSurrender) {
      clearTimeout(conn.tebakmakanan[id][4])
      delete conn.tebakmakanan[id]
      return m.reply("*Yah Menyerah :( !*")
    }
    let json = JSON.parse(JSON.stringify(conn.tebakmakanan[id][1]))
    if (m.text.toLowerCase() == json.jawaban.toLowerCase().trim()) {
      global.db.data.users[senderKey].exp += conn.tebakmakanan[id][2]
      m.reply(`*Benar!*\n+${conn.tebakmakanan[id][2]} XP`)
      clearTimeout(conn.tebakmakanan[id][4])
      delete conn.tebakmakanan[id]
    } else if (similarity(m.text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) {
      m.reply(`*Dikit Lagi!*`)
    } else if (--conn.tebakmakanan[id][3] == 0) {
      clearTimeout(conn.tebakmakanan[id][4])
      delete conn.tebakmakanan[id]
      conn.reply(m.chat, `*Kesempatan habis!*\nJawaban: *${json.jawaban}*`, m)
    } else m.reply(`*Jawaban Salah!*\nMasih ada ${conn.tebakmakanan[id][3]} kesempatan`)
  }
  return !0
}
export const exp = 0
