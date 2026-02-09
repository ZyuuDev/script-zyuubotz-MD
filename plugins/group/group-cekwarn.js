import { checkUser } from "../../lib/checkUser.js"

let limit = 5

let handler = async (m, { conn, usedPrefix, senderKey, text }) => {
  let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : senderKey

  const quotedKey = await checkUser(conn, who)

  let chat = global.db.data.chats[m.chat]
  let user = chat.member[quotedKey]

  let caption = `
Hai, ${await conn.getName(quotedKey)}
${
  user.warn == 0
    ? `
${quotedKey == senderKey ? "Kamu" : "Dia"} tidak memiliki warn`
    : `
${quotedKey == senderKey ? "Kamu" : "Dia"} memiliki ${user.warn} \n\n_Note : Jika warn telah mencapai 5 maka kamu akan dikick_`
}
`.trim()
  conn.adReply(m.chat, caption, "W A R N I N G", "", "https://pomf2.lain.la/f/xnf9kiak.jpg", "", m)
}
handler.help = ["cekwarn"]
handler.tags = ["group"]
handler.command = /^(cekwarn)$/i
handler.group = true
export default handler
