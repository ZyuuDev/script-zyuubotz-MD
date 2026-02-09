let handler = async (m, { conn, senderKey }) => {
  let sticker = global.db.data.users[senderKey].sticker
  conn.reply(m.chat, `
*DAFTAR HASH*
\`\`\`
${Object.entries(sticker).map(([key, value], index) => `${index + 1}. ${value.locked ? `(Terkunci) ${key}` : key} : ${value.text}`).join('\n')}
\`\`\`
`.trim(), m, {
    mentions: Object.values(sticker).map(x => x.mentionedJid).reduce((a, b) => [...a, ...b], [])
  }, { smlcap: true, except: Object.keys(sticker)})
}
handler.help = ['listcmd']
handler.tags = ['database']
handler.command = /^listcmd$/i

export default handler