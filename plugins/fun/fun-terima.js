let handler = async (m, { senderKey, usedPrefix, command, text }) => {
  let user = global.db.data.users
  let pacar = user[senderKey].tembak
  if (user[senderKey].tembak == "") return m.reply("Tidak ada yang nembak kamu kak :)")
  if (user[senderKey].pacar != "") return m.reply("Kamu kan sudah punya pacar kak")
  if (user[pacar].ditembak) return m.reply("Permintaan tidak valid")

  user[senderKey].pacar = pacar
  user[pacar].pacar = senderKey
  user[pacar].ditembak = false
  user[senderKey].tembak = ""
  user[pacar].tembak = ""
  user[senderKey].pacaranTime = new Date() * 1
  user[pacar].pacaranTime = new Date() * 1

  await m.reply(`Kamu berhasil menerima ${await conn.tagUser(pacar)} menjadi pacar kamu, silahkan gunakan command *#pacar* untuk mengecek pacar kamu`, false, { mentions: [pacar] })
}
handler.help = ["terima"]
handler.tags = ["fun"]
handler.command = /^(terima)$/i
export default handler

const delay = (time) => new Promise((res) => setTimeout(res, time))
