import similarity from "similarity"
const threshold = 0.72
export async function before(m, { conn, senderKey }) {
  let id = m.chat
  if (m.fromMe) return
  if (!m.quoted || !m.quoted.fromMe || !m.text || !/Ketik.*hgamb|ᴋᴇᴛɪᴋ.*ʜɢᴀᴍʙ/i.test(m.quoted.text) || /.*hgamb|.*ʜɢᴀᴍʙ/i.test(m.text)) return !0
  conn.tebakgambar = conn.tebakgambar ? conn.tebakgambar : {}
  conn.readAndComposing(m)
  if (!(id in conn.tebakgambar)) return m.reply("Soal itu telah berakhir")
  if (m.quoted.id == conn.tebakgambar[id][0].id) {
    let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text)
    if (isSurrender) {
      clearTimeout(conn.tebakgambar[id][4])
      delete conn.tebakgambar[id]
      return m.reply("*Yah Menyerah :( !*")
    }
    let json = JSON.parse(JSON.stringify(conn.tebakgambar[id][1]))
    if (m.text.toLowerCase() == json.jawaban.toLowerCase().trim()) {
      global.db.data.users[senderKey].exp += conn.tebakgambar[id][2]
      m.reply(`*Benar!*\n+${conn.tebakgambar[id][2]} XP`)
      clearTimeout(conn.tebakgambar[id][4])
      delete conn.tebakgambar[id]
    } else if (similarity(m.text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) {
      m.reply(`*Dikit Lagi!*`)
    } else if (--conn.tebakgambar[id][3] == 0) {
      clearTimeout(conn.tebakgambar[id][4])
      delete conn.tebakgambar[id]
      conn.reply(m.chat, `*Kesempatan habis!*\nJawaban: *${json.jawaban}*`, m)
    } else m.reply(`*Jawaban Salah!*\nMasih ada ${conn.tebakgambar[id][3]} kesempatan`)
  }
  return !0
}
export const exp = 0
