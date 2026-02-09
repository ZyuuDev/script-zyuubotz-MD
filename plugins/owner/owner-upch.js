import { toPtt } from "../../lib/converter.js"

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m
  const mime = q.mimetype || ''
  if (!text && !mime) return m.reply(`Mana pesan yang akan dikirim? \n\nContoh:\n${usedPrefix + command} Hai!`)
  if (/audio/.test(mime)) {
    const caption = text ? text : m.quoted ? m.quoted.text : ''
    const buffer = await q.download()
    const ptt = await toPtt(buffer)
    await conn.sendMessage(global.config.idch, { audio: ptt.data, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: m })
  } else if (!/audio/.test(mime) && mime) {
    const caption = text ? text : m.quoted ? m.quoted.text : ''
    const buffer = await q.download()
    await conn.sendFile(global.config.idch, buffer, '', caption.replace(".upch", ""), m)
  } else {
    await conn.reply(global.config.idch, (m.quoted ? m.quoted.text : text).replace(".upch", ''), m)
  }
  m.reply('Pesan berhasil dikirim!')
}
handler.help = ['upch']
handler.tags = ['owner']
handler.command = ['upch']
handler.owner = true
export default handler