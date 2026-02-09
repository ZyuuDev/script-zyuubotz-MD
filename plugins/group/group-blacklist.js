import { checkUser } from "../../lib/checkUser.js"

let handler = async (m, { conn, text, usedPrefix, command }) => {
  text = m.mentionedJid[0] || m?.quoted?.sender || text.replace(/[^0-9]/g, "") + "@s.whatsapp.net"

  const quotedKey = await checkUser(conn, text)

  if (!quotedKey) return conn.reply(m.chat, `Masukan nomor yang ingin kamu blacklist! \n\nContoh: \n${usedPrefix + command} 628xxxx`, m)
  let chat = global.db.data.chats[m.chat]
  const group = await conn.chats[m.chat]
  if (chat.blacklist.includes(quotedKey)) return conn.reply(m.chat, "Orang ini sudah ada di blacklist!", m)
  if (conn.user.jid == quotedKey) return conn.reply(m.chat, "Tidak bisa blacklist chat!", m)
  const participants = group.participants || group.metadata.participants
  if (participants.map((v) => v.id).includes(quotedKey)) {
    chat.blacklist.push(quotedKey)
    await conn.groupParticipantsUpdate(m.chat, [quotedKey], "remove")
    await conn.reply(m.chat, `Berhasil menambahkan @${quotedKey.split("@")[0]} ke blacklist!`, m, { mentions: [quotedKey] })
  } else {
    chat.blacklist.push(quotedKey)
    await conn.reply(m.chat, `Berhasil menambahkan @${quotedKey.split("@")[0]} ke blacklist!`, m, { mentions: [quotedKey] })
  }
}

handler.help = ["blacklist"]
handler.tags = ["group"]
handler.command = /^(blacklist)$/i
handler.admin = true
handler.group = true
export default handler
