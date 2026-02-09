import similarity from "similarity"
const threshold = 0.72
export async function before(m, { conn, senderKey }) {
  let id = m.chat
  if (m.fromMe) return
  if (!m.quoted || !m.quoted.fromMe || !m.text || !/Ketik.*calo|ᴋᴇᴛɪᴋ.*ᴄᴀʟᴏ/i.test(m.quoted.text) || /.*(calo|bantuan)|.*(ᴄᴀʟᴏ|ʙᴀɴᴛᴜᴀɴ)/i.test(m.text)) return !0
  conn.caklontong = conn.caklontong ? conn.caklontong : {}
  conn.readAndComposing(m)
  if (!(id in conn.caklontong)) return m.reply("Soal itu telah berakhir")
  if (m.quoted.id == conn.caklontong[id][0].id) {
    let json = JSON.parse(JSON.stringify(conn.caklontong[id][1]))
    if (m.text.toLowerCase() == json.jawaban.toLowerCase().trim()) {
      global.db.data.users[senderKey].exp += conn.caklontong[id][2]
      await conn.reply(m.chat, `*Benar!* +${conn.caklontong[id][2]} XP\n${json.deskripsi}`, m)
      clearTimeout(conn.caklontong[id][4])
      delete conn.caklontong[id]
    } else if (similarity(m.text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) {
      m.reply(`*Dikit Lagi!*`)
    } else if (--conn.caklontong[id][3] == 0) {
      clearTimeout(conn.caklontong[id][4])
      delete conn.caklontong[id]
      conn.reply(m.chat, `*Kesempatan habis!*\nJawaban: *${json.jawaban}*`, m)
    } else m.reply(`*Jawaban Salah!*\nMasih ada ${conn.caklontong[id][3]} kesempatan`)
  }
  return !0
}
export const exp = 0
