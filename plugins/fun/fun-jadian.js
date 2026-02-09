let toM = async (jid) => {
  return await conn.tagUser(jid)
}

async function handler(m, { groupMetadata }) {
  const ps = groupMetadata.participants.map((v) => v.id || v.phoneNumber)

  if (ps.length < 2) return m.reply("Butuh minimal 2 anggota untuk jadian!")

  let a = ps.getRandom()
  let b
  do b = ps.getRandom()
  while (b === a)

  const tagA = await toM(a)
  const tagB = await toM(b)

  m.reply(`${tagA} ❤️ ${tagB}`)
}

handler.help = ["jadian"]
handler.tags = ["fun"]
handler.command = /^jadian$/i
handler.group = true
export default handler
