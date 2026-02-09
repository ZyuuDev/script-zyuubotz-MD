import { checkUser } from "../../lib/checkUser.js"

let handler = async (m, { senderKey, conn, usedPrefix, command, args, isOwner, isAdmin }) => {
  let target = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : args[0] ? args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net" : false
  if (!target) return m.reply(`Tag User Atau Masukan Nomornya\n\nContoh :\n${usedPrefix + command} @${senderKey.split("@")[0]}`, false, { mentions: [senderKey] })

  const quotedKey = await checkUser(conn, target)

  if (isAdmin) {
    let user = global.db.data.chats[m.chat].member[quotedKey]
    if (typeof user == "undefined") return m.reply("User tidak ada di Database!")
    if (!user.banned) return m.reply("User tidak Terbanned!!")
    await m.reply(`Berhasil Unbanned @${quotedKey.split("@")[0]}`, false, { mentions: [quotedKey] })
    user.banned = false
    user.bannedTime = 0
  } else if (isOwner) {
    let user = global.db.data.users[quotedKey]
    if (typeof user == "undefined") return m.reply("User tidak ada di Database!")
    if (!user.banned) return m.reply("User tidak Terbanned!!")
    await m.reply(`Berhasil Unbanned @${quotedKey.split("@")[0]}`, false, { mentions: [quotedKey] })
    user.banned = false
    user.bannedTime = 0
  } else {
    global.dfail("admin", m, conn)
  }
}
handler.help = ["unbanned"]
handler.tags = ["group", "owner"]
handler.command = /^(unban(ned)?(user)?)$/i
export default handler
