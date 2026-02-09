import similarity from "similarity"
const threshold = 0.72
export async function before(m, { conn, senderKey }) {
  let id = m.chat
  if (m.fromMe) return
  if (!m.quoted || !m.quoted.fromMe || !m.text || !/Ketik.*hmia|ᴋᴇᴛɪᴋ.*ʜᴍɪᴀ/i.test(m.quoted.text) || /.*hmia|.*ʜᴍɪᴀ/i.test(m.text)) return !0
  conn.tebakkimia = conn.tebakkimia ? conn.tebakkimia : {}
  conn.readAndComposing(m)
  if (!(id in conn.tebakkimia)) return m.reply("Soal itu telah berakhir")
  if (m.quoted.id == conn.tebakkimia[id][0].id) {
    let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text)
    if (isSurrender) {
      clearTimeout(conn.tebakkimia[id][4])
      delete conn.tebakkimia[id]
      return m.reply("*Yah Menyerah :( !*")
    }
    let json = JSON.parse(JSON.stringify(conn.tebakkimia[id][1]))
    if (m.text.toLowerCase() == json.unsur.toLowerCase().trim()) {
      global.db.data.users[senderKey].exp += conn.tebakkimia[id][2]
      m.reply(`*Benar!*\n+${conn.tebakkimia[id][2]} XP`)
      clearTimeout(conn.tebakkimia[id][4])
      delete conn.tebakkimia[id]
    } else if (similarity(m.text.toLowerCase(), json.unsur.toLowerCase().trim()) >= threshold) {
      m.reply(`*Dikit Lagi!*`)
    } else if (--conn.tebakkimia[id][3] == 0) {
      clearTimeout(conn.tebakkimia[id][4])
      delete conn.tebakkimia[id]
      conn.reply(m.chat, `*Kesempatan habis!*\nJawaban: *${json.jawaban}*`, m)
    } else m.reply(`*Jawaban Salah!*\nMasih ada ${conn.tebakkimia[id][3]} kesempatan`)
  }
  return !0
}
export const exp = 0
