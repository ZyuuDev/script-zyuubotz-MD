let handler = async (m, { text }) => {
  if (!text) return m.reply("Isinya ?")
  await conn.groupUpdateDescription(m.chat, text)
  return m.reply("Done.")
}
handler.help = ["setdesc"]
handler.tags = ["group"]
handler.command = /^(setdesc|sdesc)$/i

handler.group = true
handler.admin = true

export default handler
