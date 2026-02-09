import { webp2mp4File, toVideo } from '../../lib/converter.js'

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''
        if (/audio/.test(mime)) {
            let media = await q.download()
            let result = await toVideo(media)
            await conn.sendFile(m.chat, result.data, 'video.mp4', '', m)
        } else if (/webp/.test(mime) && q.isAnimated) {
            await conn.loading(m, conn)
            let media = await q.download(true)
            let { result } = await webp2mp4File(media)
            let { data } = await conn.getFile(result)
            await conn.sendFile(m.chat, data, '', '', m)
        } else {
            m.reply(`Kirim/Balas Sticker Gif/Audio Dengan Command *${usedPrefix + command}*`)
        }
    } finally {
        await conn.loading(m, conn, true)
    }
}
handler.help = ['tovideo']
handler.tags = ['sticker']
handler.command = /^(to(vid(eo)?|mp4))$/i
export default handler
