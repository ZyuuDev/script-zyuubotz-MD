import { checkUser } from "../../lib/checkUser.js"

let handler = async (m, { conn, args, usedPrefix, command, isOwner, isAdmin, senderKey }) => {
  let target = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : args[0] ? args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net" : false
  if (!target) return m.reply(`Tag User Atau Masukan Nomornya\n\nContoh :\n${usedPrefix + command} @${senderKey.split("@")[0]} 4`, false, { mentions: [senderKey] })

  const quotedKey = await checkUser(conn, target)

  if (isAdmin) {
    let footer = `_Sekarang @${quotedKey.split("@")[0]} Tidak Bisa Menggunakan Bot Di Group Ini!_`
    let user = global.db.data.chats[m.chat].member[quotedKey]
    if (args[1]) {
      if (isNaN(args[1])) return m.reply("Hanya Angka!")
      m.reply(`Sukses Membanned @${quotedKey.split("@")[0]} Selama ${args[1]} Hari \n${footer}`, false, { mentions: [quotedKey] })
      let jumlahHari = 86400000 * args[1]
      user.bannedTime = Math.max(Date.now(), user.bannedTime) + jumlahHari
      user.banned = true
    } else {
      m.reply(`Sukses Membanned @${quotedKey.split("@")[0]}, \n${footer}`, false, { mentions: [quotedKey] })
      user.bannedTime = 17
      user.banned = true
    }
  } else if (isOwner) {
    let user = global.db.data.users[quotedKey]
    if (args[1]) {
      if (isNaN(args[1])) return m.reply("Hanya Angka!")
      m.reply(`Sukses Membanned @${quotedKey.split("@")[0]} Selama ${args[1]} Hari`, false, { mentions: [quotedKey] })
      let jumlahHari = 86400000 * args[1]
      user.bannedTime = Math.max(Date.now(), user.bannedTime) + jumlahHari
      user.banned = true
    } else {
      m.reply(`Sukses Membanned @${quotedKey.split("@")[0]}`, false, { mentions: [quotedKey] })
      user.bannedTime = 17
      user.banned = true
    }
  } else {
    global.dfail("admin", m, conn)
  }
}
handler.help = ["banned"]
handler.tags = ["group", "owner"]
handler.command = /^(ban(user)?|banned(user)?)$/i
export default handler
