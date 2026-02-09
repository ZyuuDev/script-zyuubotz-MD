export async function before(m, { conn, senderKey }) {
  if (!/^-?[0-9]+(\.[0-9]+)?$/.test(m.text)) return !0
  let id = m.chat
  if (m.fromMe) return
  if (!m.quoted || !m.quoted.fromMe || !m.text || !/^Berapa hasil dari|ʙᴇʀᴀᴘᴀ ʜᴀꜱɪʟ ᴅᴀʀɪ/i.test(m.quoted.text)) return !0
  conn.math = conn.math ? conn.math : {}
  conn.readAndComposing(m)
  if (!(id in conn.math)) return conn.reply(m.chat, "Soal itu telah berakhir", m)
  if (m.quoted.id == conn.math[id][0].id) {
    let math = JSON.parse(JSON.stringify(conn.math[id][1]))
    if (m.text == math.result) {
      global.db.data.users[senderKey].exp += math.bonus
      clearTimeout(conn.math[id][3])
      delete conn.math[id]
      conn.reply(m.chat, `*Jawaban Benar!*\n+${math.bonus} XP`, m)
    } else {
      if (--conn.math[id][2] == 0) {
        clearTimeout(conn.math[id][3])
        delete conn.math[id]
        conn.reply(m.chat, `*Kesempatan habis!*\nJawaban: *${math.result}*`, m)
      } else m.reply(`*Jawaban Salah!*\nMasih ada ${conn.math[id][2]} kesempatan`)
    }
  }
  return !0
}
