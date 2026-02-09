import similarity from "similarity"
const threshold = 0.72
export async function before(m, { conn, senderKey }) {
  let id = m.chat
  if (m.fromMe) return
  if (!m.quoted || !m.quoted.fromMe || !m.text || !/Ketik.*hlogo|ᴋᴇᴛɪᴋ.*ʜʟᴏɢᴏ/i.test(m.quoted.text) || /.*hlogo|.*ʜʟᴏɢᴏ/i.test(m.text)) return !0
  conn.tebaklogo = conn.tebaklogo ? conn.tebaklogo : {}
  conn.readAndComposing(m)
  if (!(id in conn.tebaklogo)) return m.reply("Soal itu telah berakhir")
  if (m.quoted.id == conn.tebaklogo[id][0].id) {
    let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text)
    if (isSurrender) {
      clearTimeout(conn.tebaklogo[id][4])
      delete conn.tebaklogo[id]
      return m.reply("*Yah Menyerah :( !*")
    }
    let json = JSON.parse(JSON.stringify(conn.tebaklogo[id][1]))
    if (m.text.toLowerCase() == json.jawaban.toLowerCase().trim()) {
      global.db.data.users[senderKey].exp += conn.tebaklogo[id][2]
      m.reply(`*Benar!*\n+${conn.tebaklogo[id][2]} XP`)
      clearTimeout(conn.tebaklogo[id][4])
      delete conn.tebaklogo[id]
    } else if (similarity(m.text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) {
      m.reply(`*Dikit Lagi!*`)
    } else if (--conn.tebaklogo[id][3] == 0) {
      clearTimeout(conn.tebaklogo[id][4])
      delete conn.tebaklogo[id]
      conn.reply(m.chat, `*Kesempatan habis!*\nJawaban: *${json.jawaban}*`, m)
    } else m.reply(`*Jawaban Salah!*\nMasih ada ${conn.tebaklogo[id][3]} kesempatan`)
  }
  return !0
}
export const exp = 0
