import similarity from "similarity"
const threshold = 0.72
export async function before(m, { conn, senderKey }) {
  let id = m.chat
  if (m.fromMe) return
  if (!m.quoted || !m.quoted.fromMe || !m.text || !/Ketik.*terik|ᴋᴇᴛɪᴋ.*ᴛᴇʀɪᴋ/i.test(m.quoted.text) || /.*terik|.*ᴛᴇʀɪᴋ/i.test(m.text)) return !0
  conn.tebaklirik = conn.tebaklirik ? conn.tebaklirik : {}
  conn.readAndComposing(m)
  if (!(id in conn.tebaklirik)) return m.reply("Soal itu telah berakhir")
  if (m.quoted.id == conn.tebaklirik[id][0].id) {
    let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text)
    if (isSurrender) {
      clearTimeout(conn.tebaklirik[id][4])
      delete conn.tebaklirik[id]
      return m.reply("*Yah Menyerah :( !*")
    }
    let json = JSON.parse(JSON.stringify(conn.tebaklirik[id][1]))
    if (m.text.toLowerCase() == json.jawaban.toLowerCase().trim()) {
      global.db.data.users[senderKey].exp += conn.tebaklirik[id][2]
      m.reply(`*Benar!*\n+${conn.tebaklirik[id][2]} XP`)
      clearTimeout(conn.tebaklirik[id][4])
      delete conn.tebaklirik[id]
    } else if (similarity(m.text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) {
      m.reply(`*Dikit Lagi!*`)
    } else if (--conn.tebaklirik[id][3] == 0) {
      clearTimeout(conn.tebaklirik[id][4])
      delete conn.tebaklirik[id]
      conn.reply(m.chat, `*Kesempatan habis!*\nJawaban: *${json.jawaban}*`, m)
    } else m.reply(`*Jawaban Salah!*\nMasih ada ${conn.tebaklirik[id][3]} kesempatan`)
  }
  return !0
}
export const exp = 0
