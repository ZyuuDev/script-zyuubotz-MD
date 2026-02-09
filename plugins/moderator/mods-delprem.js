import { checkUser } from "../../lib/checkUser.js"

let handler = async (m, { usedPrefix, command, text }) => {
  let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : false

  const quotedKey = await checkUser(conn, who)

  let user = global.db.data.users[quotedKey]
  if (!quotedKey) return m.reply(`Tag Atau Masukan Nomornya!\n\nContoh :\n${usedPrefix + command} @${senderKey.split`@`[0]}`, false, { mentions: quotedKey })
  user.premium = false
  user.premiumTime = 0
  m.reply(`✔️ successfully removed *${user.name}* from premium user`)
}
handler.help = ["delprem"]
handler.tags = ["mods"]
handler.command = /^(-|del)p(rem)?$/i
handler.mods = true
export default handler
