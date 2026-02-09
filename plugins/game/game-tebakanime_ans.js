import similarity from "similarity"
const threshold = 0.72
export async function before(m, { conn, senderKey }) {
  let id = m.chat
  if (m.fromMe) return
  if (!m.quoted || !m.quoted.fromMe || !m.text || !/Ketik.*hnime|ᴋᴇᴛɪᴋ.*ʜɴɪᴍᴇ/i.test(m.quoted.text) || /.*hnime|.*ʜɴɪᴍᴇ/i.test(m.text)) return !0
  conn.tebakanime = conn.tebakanime ? conn.tebakanime : {}
  conn.readAndComposing(m)
  if (!(id in conn.tebakanime)) return m.reply("Soal itu telah berakhir")
  if (m.quoted.id == conn.tebakanime[id][0].id) {
    let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text)
    if (isSurrender) {
      clearTimeout(conn.tebakanime[id][4])
      delete conn.tebakanime[id]
      return m.reply("*Yah Menyerah :( !*")
    }
    let json = JSON.parse(JSON.stringify(conn.tebakanime[id][1]))
    if (m.text.toLowerCase() == json.jawaban.toLowerCase().trim()) {
      global.db.data.users[senderKey].exp += conn.tebakanime[id][2]
      m.reply(`*Benar!*\n+${conn.tebakanime[id][2]} XP`)
      clearTimeout(conn.tebakanime[id][4])
      delete conn.tebakanime[id]
    } else if (similarity(m.text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) {
      m.reply(`*Dikit Lagi!*`)
    } else if (--conn.tebakanime[id][3] == 0) {
      clearTimeout(conn.tebakanime[id][4])
      delete conn.tebakanime[id]
      conn.reply(m.chat, `*Kesempatan habis!*\nJawaban: *${json.jawaban}*`, m)
    } else m.reply(`*Jawaban Salah!*\nMasih ada ${conn.tebakanime[id][3]} kesempatan`)
  }
  return !0
}
export const exp = 0
