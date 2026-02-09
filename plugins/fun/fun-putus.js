let handler = async (m, { senderKey }) => {
  let user = global.db.data.users
  let pacar = user[senderKey].pacar

  if (user[senderKey].pacar == "") return m.reply("Kamu tidak memiliki pacar")

  user[senderKey].pacar = ""
  user[pacar].pacar = ""
  user[senderKey].pacaranTime = ""
  user[pacar].pacaranTime = ""

  await m.reply(`Kamu telah putus dengan ${await conn.tagUser(pacar)}`, false, { mentions: [pacar] })
}
handler.help = ["putus"]
handler.tags = ["fun"]
handler.command = /^(putus)$/i
handler.group = true
export default handler

const delay = (time) => new Promise((res) => setTimeout(res, time))
