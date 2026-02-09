import similarity from "similarity"
const threshold = 0.72
export async function before(m, { conn, senderKey }) {
  let id = m.chat
  if (m.fromMe) return
  if (!m.quoted || !m.quoted.fromMe || !m.text || !/Ketik.*hwan|ᴋᴇᴛɪᴋ.*ʜᴡᴀɴ/i.test(m.quoted.text) || /.*hwan|.*ʜᴡᴀɴ/i.test(m.text)) return !0
  conn.tebakhewan = conn.tebakhewan ? conn.tebakhewan : {}
  conn.readAndComposing(m)
  if (!(id in conn.tebakhewan)) return m.reply("Soal itu telah berakhir")
  if (m.quoted.id == conn.tebakhewan[id][0].id) {
    let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text)
    if (isSurrender) {
      clearTimeout(conn.tebakhewan[id][4])
      delete conn.tebakhewan[id]
      return m.reply("*Yah Menyerah :( !*")
    }
    let json = JSON.parse(JSON.stringify(conn.tebakhewan[id][1]))
    if (m.text.toLowerCase() == json.nama.toLowerCase().trim()) {
      global.db.data.users[senderKey].exp += conn.tebakhewan[id][2]
      m.reply(`*Benar!*\n+${conn.tebakhewan[id][2]} XP`)
      clearTimeout(conn.tebakhewan[id][4])
      delete conn.tebakhewan[id]
    } else if (similarity(m.text.toLowerCase(), json.nama.toLowerCase().trim()) >= threshold) {
      m.reply(`*Dikit Lagi!*`)
    } else if (--conn.tebakhewan[id][3] == 0) {
      clearTimeout(conn.tebakhewan[id][4])
      delete conn.tebakhewan[id]
      conn.reply(m.chat, `*Kesempatan habis!*\nJawaban: *${json.nama}*`, m)
    } else m.reply(`*Jawaban Salah!*\nMasih ada ${conn.tebakhewan[id][3]} kesempatan`)
  }
  return !0
}
export const exp = 0
