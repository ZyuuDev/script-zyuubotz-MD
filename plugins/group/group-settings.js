let handler = async (m, { conn, command }) => {
  let groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat) : {}
  let groupName = groupMetadata.subject || "this group"

  if (/groupopen|gcopen/i.test(command)) {
    await conn.groupSettingUpdate(m.chat, "not_announcement")
    m.reply(`The group ${groupName} is now open for all members to send messages.`)
  } else if (/groupclose|gcclose/i.test(command)) {
    await conn.groupSettingUpdate(m.chat, "announcement")
    m.reply(`The group ${groupName} is now closed. Only admins can send messages.`)
  }
}
handler.help = ["groupopen", "groupclose"]
handler.tags = ["group"]
handler.command = /^(groupopen|groupclose|gcopen|gcclose)$/i

handler.admin = true
handler.botAdmin = true

export default handler
