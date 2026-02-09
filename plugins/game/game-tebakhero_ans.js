import similarity from "similarity"
const threshold = 0.72
export async function before(m, { conn, senderKey }) {
  let id = m.chat
  if (m.fromMe) return
  if (!m.quoted || !m.quoted.fromMe || !m.text || !/Ketik.*hro|ᴋᴇᴛɪᴋ.*ʜʀᴏ/i.test(m.quoted.text) || /.*hro|.*ʜʀᴏ/i.test(m.text)) return !0
  conn.tebakhero = conn.tebakhero ? conn.tebakhero : {}
  conn.readAndComposing(m)
  if (!(id in conn.tebakhero)) return m.reply("Soal itu telah berakhir")
  if (m.quoted.id == conn.tebakhero[id][0].id) {
    let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text)
    if (isSurrender) {
      clearTimeout(conn.tebakhero[id][4])
      delete conn.tebakhero[id]
      return m.reply("*Yah Menyerah :( !*")
    }
    let json = JSON.parse(JSON.stringify(conn.tebakhero[id][1]))
    if (m.text.toLowerCase() == json.jawaban.toLowerCase().trim()) {
      global.db.data.users[senderKey].exp += conn.tebakhero[id][2]
      m.reply(`*Benar!*\n+${conn.tebakhero[id][2]} XP`)
      clearTimeout(conn.tebakhero[id][4])
      delete conn.tebakhero[id]
    } else if (similarity(m.text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) {
      m.reply(`*Dikit Lagi!*`)
    } else if (--conn.tebakhero[id][3] == 0) {
      clearTimeout(conn.tebakhero[id][4])
      delete conn.tebakhero[id]
      conn.reply(m.chat, `*Kesempatan habis!*\nJawaban: *${json.jawaban}*`, m)
    } else m.reply(`*Jawaban Salah!*\nMasih ada ${conn.tebakhero[id][3]} kesempatan`)
  }
  return !0
}
export const exp = 0
