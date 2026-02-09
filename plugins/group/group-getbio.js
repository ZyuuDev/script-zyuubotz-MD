import { checkUser } from "../../lib/checkUser.js"

let handler = async (m, { conn, text, senderKey }) => {
  try {
    let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender
    else who = m.quoted.sender ? m.quoted.sender : senderKey

    const quotedKey = await checkUser(m, who)

    let bio = await conn.fetchStatus(quotedKey)
    m.reply(bio.status)
  } catch {
    if (text) return m.reply(`bio is private!`)
    else
      try {
        let who = m.quoted ? m.quoted.sender : senderKey
        const quotedKey = await checkUser(m, who)
        let bio = await conn.fetchStatus(quotedKey)
        m.reply(bio.status)
      } catch {
        return m.reply(`bio is private!`)
      }
  }
}
handler.help = ["getbio"]
handler.tags = ["group"]
handler.command = /^(getb?io)$/i
handler.limit = true
export default handler
