import similarity from "similarity"
const threshold = 0.72
export async function before(m, { conn, senderKey }) {
  let id = m.chat
  if (m.fromMe) return
  if (!m.quoted || !m.quoted.fromMe || !m.text || !/Ketik.*hcha|ᴋᴇᴛɪᴋ.*ʜᴄʜᴀ/i.test(m.quoted.text) || /.*hcha|.*ʜᴄʜᴀ/i.test(m.text)) return !0
  conn.tebakchara = conn.tebakchara ? conn.tebakchara : {}
  conn.readAndComposing(m)
  if (!(id in conn.tebakchara)) return m.reply("Soal itu telah berakhir")
  if (m.quoted.id == conn.tebakchara[id][0].id) {
    let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text)
    if (isSurrender) {
      clearTimeout(conn.tebakchara[id][4])
      delete conn.tebakchara[id]
      return m.reply("*Yah Menyerah :( !*")
    }
    let json = JSON.parse(JSON.stringify(conn.tebakchara[id][1]))
    if (m.text.toLowerCase() == json.name.toLowerCase().trim()) {
      global.db.data.users[senderKey].exp += conn.tebakchara[id][2]
      m.reply(`*Benar!*\n+${conn.tebakchara[id][2]} XP`)
      clearTimeout(conn.tebakchara[id][4])
      delete conn.tebakchara[id]
    } else if (similarity(m.text.toLowerCase(), json.name.toLowerCase().trim()) >= threshold) {
      m.reply(`*Dikit Lagi!*`)
    } else if (--conn.tebakchara[id][3] == 0) {
      clearTimeout(conn.tebakchara[id][4])
      delete conn.tebakchara[id]
      conn.reply(m.chat, `*Kesempatan habis!*\nJawaban: *${json.jawaban}*`, m)
    } else m.reply(`*Jawaban Salah!*\nMasih ada ${conn.tebakchara[id][3]} kesempatan`)
  }
  return !0
}
export const exp = 0
