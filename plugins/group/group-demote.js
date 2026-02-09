import { checkUser } from "../../lib/checkUser.js"

let handler = async (m, { conn, usedPrefix, command, text, senderKey }) => {
  let target = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : false

  const targetUser = await checkUser(conn, target)

  if (!targetUser) {
    return m.reply(`❌ Reply atau tag orangnya!\n\nContoh:\n${usedPrefix + command} @${senderKey.split("@")[0]}`)
  }

  if (targetUser === senderKey) {
    return m.reply("❌ Tidak bisa demote diri sendiri!")
  }

  if (targetUser === conn.user.jid) {
    return m.reply("❌ Tidak bisa demote bot!")
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, [targetUser], "demote")
    await delay(1000)

    await m.reply(`✅ Berhasil memberhentikan @${targetUser.split("@")[0]} sebagai admin!`)
  } catch (error) {
    console.error("Error demoting user:", error)
    await m.reply(`❌ Gagal memberhentikan user. Pastikan bot adalah admin grup.`)
  }
}

handler.help = ["demote"]
handler.tags = ["group"]
handler.command = /^(demote)$/i
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
