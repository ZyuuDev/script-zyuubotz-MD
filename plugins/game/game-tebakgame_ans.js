import similarity from "similarity"
const threshold = 0.72
export async function before(m, { conn, senderKey }) {
  let id = m.chat
  if (m.fromMe) return
  if (!m.quoted || !m.quoted.fromMe || !m.text || !/Ketik.*hgame|ᴋᴇᴛɪᴋ.*ʜɢᴀᴍᴇ/i.test(m.quoted.text) || /.*hgame|.*ʜɢᴀᴍᴇ/i.test(m.text)) return !0
  conn.tebakgame = conn.tebakgame ? conn.tebakgame : {}
  conn.readAndComposing(m)
  if (!(id in conn.tebakgame)) return m.reply("Soal itu telah berakhir")
  if (m.quoted.id == conn.tebakgame[id][0].id) {
    let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text)
    if (isSurrender) {
      clearTimeout(conn.tebakgame[id][4])
      delete conn.tebakgame[id]
      return m.reply("*Yah Menyerah :( !*")
    }
    let json = JSON.parse(JSON.stringify(conn.tebakgame[id][1]))
    if (m.text.toLowerCase() == json.jawaban.toLowerCase().trim()) {
      global.db.data.users[senderKey].exp += conn.tebakgame[id][2]
      m.reply(`*Benar!*\n+${conn.tebakgame[id][2]} XP`)
      clearTimeout(conn.tebakgame[id][4])
      delete conn.tebakgame[id]
    } else if (similarity(m.text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) {
      m.reply(`*Dikit Lagi!*`)
    } else if (--conn.tebakgame[id][3] == 0) {
      clearTimeout(conn.tebakgame[id][4])
      delete conn.tebakgame[id]
      conn.reply(m.chat, `*Kesempatan habis!*\nJawaban: *${json.jawaban}*`, m)
    } else m.reply(`*Jawaban Salah!*\nMasih ada ${conn.tebakgame[id][3]} kesempatan`)
  }
  return !0
}
export const exp = 0
