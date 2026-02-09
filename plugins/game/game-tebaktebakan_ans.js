import similarity from "similarity"
const threshold = 0.72
export async function before(m, { conn, senderKey }) {
  let id = m.chat
  if (m.fromMe) return
  if (!m.quoted || !m.quoted.fromMe || !m.text || !/Ketik.*hkan|ᴋᴇᴛɪᴋ.*ʜᴋᴀɴ/i.test(m.quoted.text) || /.*hkan|.*ʜᴋᴀɴ/i.test(m.text)) return !0
  conn.tebaktebakan = conn.tebaktebakan ? conn.tebaktebakan : {}
  conn.readAndComposing(m)
  if (!(id in conn.tebaktebakan)) return m.reply("Soal itu telah berakhir")
  if (m.quoted.id == conn.tebaktebakan[id][0].id) {
    let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text)
    if (isSurrender) {
      clearTimeout(conn.tebaktebakan[id][4])
      delete conn.tebaktebakan[id]
      return m.reply("*Yah Menyerah :( !*")
    }
    let json = JSON.parse(JSON.stringify(conn.tebaktebakan[id][1]))
    // m.reply(JSON.stringify(json, null, '\t'))
    if (m.text.toLowerCase() == json.jawaban.toLowerCase().trim()) {
      global.db.data.users[senderKey].exp += conn.tebaktebakan[id][2]
      m.reply(`*Benar!*\n+${conn.tebaktebakan[id][2]} XP`)
      clearTimeout(conn.tebaktebakan[id][4])
      delete conn.tebaktebakan[id]
    } else if (similarity(m.text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) {
      m.reply(`*Dikit Lagi!*`)
    } else if (--conn.tebaktebakan[id][3] == 0) {
      clearTimeout(conn.tebaktebakan[id][4])
      delete conn.tebaktebakan[id]
      conn.reply(m.chat, `*Kesempatan habis!*\nJawaban: *${json.jawaban}*`, m)
    } else m.reply(`*Jawaban Salah!*\nMasih ada ${conn.tebaktebakan[id][3]} kesempatan`)
  }
  return !0
}
export const exp = 0
