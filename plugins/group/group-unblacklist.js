import { checkUser } from "../../lib/checkUser.js"

let handler = async (m, { conn, text, usedPrefix, command }) => {
  text = m.mentionedJid[0] || m?.quoted?.sender || text.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
  const quotedKey = await checkUser(conn, text)
  if (!quotedKey) return conn.reply(m.chat, `Masukan nomor yang ingin kamu hapus blacklistnya! \n\nContoh: \n${usedPrefix + command} 628xxxx`, m)
  let chat = global.db.data.chats[m.chat]
  if (!chat.blacklist.includes(quotedKey)) return conn.reply(m.chat, "Orang ini tidak ada di blacklist!", m)
  if (conn.user.jid == quotedKey) return conn.reply(m.chat, "Tidak bisa blacklist chat!", m)
  chat.blacklist = chat.blacklist.filter((user) => user != quotedKey)
  await conn.reply(m.chat, `Berhasil menghapus @${quotedKey.split("@")[0]} dari blacklist!`, m, { mentions: [quotedKey] })
}
handler.help = ["unblacklist"]
handler.tags = ["group"]
handler.command = /^(unblacklist)$/i
handler.admin = true
handler.group = true
export default handler
