import { checkUser } from "../../lib/checkUser.js"

let handler = async (m, { senderKey, usedPrefix, command, text }) => {
  let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : false
  if (!who) return m.reply(`Reply atau tag orangnya! \n\nContoh : \n${usedPrefix + command} @user`)
  let quotedKey = await checkUser(conn, who)
  let user = global.db.data.users

  if (/batal/i.test(text)) {
    quotedKey = user[senderKey].tembak
    if (user[quotedKey].tembak == senderKey) {
      user[quotedKey].tembak = ""
      user[quotedKey].ditembak = false
      user[senderKey].tembak = ""
      user[senderKey].ditembak = false
      m.reply(`✔️ Berhasil membatalkan menembak orang ini!`)
    } else {
      m.reply(`✔️ Berhasil membatalkan menembak orang ini!`)
    }
    return
  }

  if (typeof user[quotedKey] == "undefined") return m.reply("Orang ini tidak ada di database")
  if (user[quotedKey].pacar == senderKey) return m.reply("Orang ini sudah menjadi pacar kamu")
  if (user[quotedKey].pacar != "") return m.reply("Orang ini sudah memiliki pacar")
  if (user[quotedKey].tembak == senderKey) return m.reply("Kamu sudah menembak orang ini, silahkan tunggu jawaban darinya!")
  if (user[quotedKey].tembak != "") return m.reply(`Orang ini sudah di tembak!`, false, { mentions: [user[quotedKey].tembak] })
  if (user[senderKey].pacar != "") return m.reply("Kamu sudah memiliki pacar! jangan selingkuh!")
  if (user[senderKey].tembak != "") return m.reply(`Kamu sudah menembak ${await conn.tagUser(user[senderKey].tembak)}, jangan menembak orang lain dulu!`, false, { mentions: [user[senderKey].tembak] })
  if (quotedKey == senderKey) return m.reply("Tidak bisa menembak diri sendiri")

  user[quotedKey].tembak = senderKey
  user[quotedKey].ditembak = true
  user[senderKey].tembak = quotedKey
  user[senderKey].ditembak = false

  await m.reply(`Kamu sudah menembak ${await conn.tagUser(quotedKey)} untuk menjadi pacar kamu! Silahkan tunggu jawaban darinya... \n\nKetik: \n${usedPrefix}terima - Untuk menerima \n${usedPrefix}tolak - Untuk menolak\n\n_Untuk membatalkan menembak orang ini ketik: *${usedPrefix + command} batal*_`, false, { mentions: [quotedKey] })
}
handler.help = ["tembak"]
handler.tags = ["fun"]
handler.command = /^(tembak)$/i
handler.group = true
export default handler
