import { checkUser } from "../../lib/checkUser.js"

let handler = async (m, { conn, usedPrefix, command, text, senderKey }) => {
  let target = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : false

  const targetUser = await checkUser(conn, target)

  if (!targetUser) {
    return m.reply(`❌ Reply atau tag orangnya!\n\nContoh:\n${usedPrefix + command} @${senderKey.split("@")[0]}`)
  }

  if (targetUser === senderKey) {
    return m.reply("❌ Tidak bisa kick diri sendiri!")
  }

  if (targetUser === conn.user.jid) {
    return m.reply("❌ Tidak bisa kick bot!")
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, [targetUser], "remove")
    await delay(1000)

    await m.reply(`✅ Berhasil mengeluarkan @${targetUser.split("@")[0]} dari grup!`)
  } catch (error) {
    console.error("Error promoting user:", error)
    await m.reply(`❌ Gagal mengeluarkan user. Pastikan bot adalah admin grup.`)
  }
}

handler.help = ["kick"]
handler.tags = ["group"]
handler.command = /^(kick)$/i
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
