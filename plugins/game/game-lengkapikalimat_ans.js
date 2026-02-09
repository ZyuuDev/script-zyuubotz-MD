import similarity from "similarity"
const threshold = 0.72
export async function before(m, { conn, senderKey }) {
  let id = m.chat
  if (m.fromMe) return
  if (!m.quoted || !m.quoted.fromMe || !m.text || !/Ketik.*hlen|ᴋᴇᴛɪᴋ.*ʜʟᴇɴ/i.test(m.quoted.text) || /.*hlen|.*ʜʟᴇɴ/i.test(m.text)) return !0
  conn.lengkapikalimat = conn.lengkapikalimat ? conn.lengkapikalimat : {}
  conn.readAndComposing(m)
  if (!(id in conn.lengkapikalimat)) return m.reply("Soal itu telah berakhir")
  if (m.quoted.id == conn.lengkapikalimat[id][0].id) {
    let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text)
    if (isSurrender) {
      clearTimeout(conn.lengkapikalimat[id][4])
      delete conn.lengkapikalimat[id]
      return m.reply("*Yah Menyerah :( !*")
    }
    let json = JSON.parse(JSON.stringify(conn.lengkapikalimat[id][1]))
    if (m.text.toLowerCase() == json.jawaban.toLowerCase().trim()) {
      global.db.data.users[senderKey].exp += conn.lengkapikalimat[id][2]
      m.reply(`*Benar!*\n+${conn.lengkapikalimat[id][2]} XP`)
      clearTimeout(conn.lengkapikalimat[id][4])
      delete conn.lengkapikalimat[id]
    } else if (similarity(m.text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) {
      m.reply(`*Dikit Lagi!*`)
    } else if (--conn.lengkapikalimat[id][3] == 0) {
      clearTimeout(conn.lengkapikalimat[id][4])
      delete conn.lengkapikalimat[id]
      conn.reply(m.chat, `*Kesempatan habis!*\nJawaban: *${json.jawaban}*`, m)
    } else m.reply(`*Jawaban Salah!*\nMasih ada ${conn.lengkapikalimat[id][3]} kesempatan`)
  }
  return !0
}
export const exp = 0
