import { toPtt } from '../../lib/converter.js'

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    let q = m.quoted ? m.quoted: m
    let mime = (m.quoted ? m.quoted: m.msg).mimetype || ''
    if (!/video|audio/.test(mime)) return m.reply(`reply video/audio you want to convert to voice note/vn with caption *${usedPrefix + command}*`)
    await conn.loading(m, conn)
    let media = await q.download()
    let ptt = await toPtt(media)
    await conn.sendMessage(m.chat, { audio: ptt.data, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: m })
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ['tovn']
handler.tags = ['audio']
handler.command = /^to(vn|(ptt)?)$/i
export default handler