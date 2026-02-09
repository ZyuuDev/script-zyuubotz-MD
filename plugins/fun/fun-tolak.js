let handler = async (m, { senderKey, command, text }) => {
  let user = global.db.data.users
  let pacar = user[senderKey].tembak
  if (user[senderKey].tembak == "") return m.reply("Tidak ada yang nembak kamu kak :)")
  if (user[senderKey].tembak == senderKey) return m.reply(`Hanya @${user[senderKey].tembak} yang bisa menjawab`)
  if (!user[senderKey].ditembak) return m.reply("Permintaan tidak valid")

  user[senderKey].tembak = ""
  user[pacar].tembak = ""
  user[pacar].ditembak = false

  await m.reply(`Kamu telah menolak ${await conn.tagUser(pacar)}`, false, { mentions: [pacar] })
}
handler.help = ["tolak"]
handler.tags = ["fun"]
handler.command = /^(tolak)$/i
export default handler

const delay = (time) => new Promise((res) => setTimeout(res, time))
