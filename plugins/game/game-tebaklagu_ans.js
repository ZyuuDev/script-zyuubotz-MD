import similarity from "similarity"
const threshold = 0.72
export async function before(m, { conn, senderKey }) {
  let id = m.chat
  if (m.fromMe) return
  if (!m.quoted || !m.quoted.fromMe || !m.text || !/Ketik.*hlagu|ᴋᴇᴛɪᴋ.*ʜʟᴀɢᴜ/i.test(m.quoted.text) || /.*hlagu|.*ʜʟᴀɢᴜ/i.test(m.text)) return !0
  conn.tebaklagu = conn.tebaklagu ? conn.tebaklagu : {}
  conn.readAndComposing(m)
  if (!(id in conn.tebaklagu)) return m.reply("Soal itu telah berakhir")
  if (m.quoted.id == conn.tebaklagu[id][0].id) {
    let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text)
    if (isSurrender) {
      clearTimeout(conn.tebaklagu[id][4])
      delete conn.tebaklagu[id]
      return m.reply("*Yah Menyerah :( !*")
    }
    let json = JSON.parse(JSON.stringify(conn.tebaklagu[id][1]))
    if (m.text.toLowerCase() == json.judul.toLowerCase().trim()) {
      global.db.data.users[senderKey].exp += conn.tebaklagu[id][2]
      m.reply(`*Benar!*\n+${conn.tebaklagu[id][2]} XP`)
      clearTimeout(conn.tebaklagu[id][4])
      delete conn.tebaklagu[id]
    } else if (similarity(m.text.toLowerCase(), json.judul.toLowerCase().trim()) >= threshold) {
      m.reply(`*Dikit Lagi!*`)
    } else if (--conn.tebaklagu[id][3] == 0) {
      clearTimeout(conn.tebaklagu[id][4])
      delete conn.tebaklagu[id]
      conn.reply(m.chat, `*Kesempatan habis!*\nJawaban: *${json.jawaban}*`, m)
    } else m.reply(`*Jawaban Salah!*\nMasih ada ${conn.tebaklagu[id][3]} kesempatan`)
  }
  return !0
}
export const exp = 0
