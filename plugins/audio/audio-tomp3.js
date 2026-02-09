import { toAudio } from '../../lib/converter.js'

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        let q = m.quoted ? m.quoted: m
        let mime = (m.quoted ? m.quoted: m.msg).mimetype || ''
        if (!/video|audio/.test(mime)) return m.reply(`reply video/voice note you want to convert to audio/mp3 with caption *${usedPrefix + command}*`)
        await conn.loading(m, conn)
        let media = await q.download?.()
        if (!media) return m.reply('Can\'t download media')
        let audio = await toAudio(media)
        if (!audio.data) return m.reply('Can\'t convert media to audio')
        await conn.sendFile(m.chat, audio.data, 'audio.mp3', '', m, null, { mimetype: 'audio/mpeg' })
    } finally {
        await conn.loading(m, conn, true)
    }
}
handler.help = ['tomp3']
handler.tags = ['audio']
handler.command = /^(to(mp3|a(udio)?))$/i

export default handler