import sharp from "sharp"
import fs from "fs"
let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        let notStickerMessage = `Kirim/Balas Sticker Dengan Command *${usedPrefix + command}*`
        if (!m.quoted) return m.reply(notStickerMessage)
        let q = m.quoted ? m.quoted : m
        let mime = q.mediaType || ''
        if (!/sticker/.test(mime)) return m.reply(notStickerMessage)
        await conn.loading(m, conn)
        let media = await q.download()
        let filename = "./tmp/" + Date.now() + ".jpg"
        await sharp(media).toFormat('jpeg').toFile(filename)
        await conn.sendFile(m.chat, fs.readFileSync(filename), 'toimg.jpg', '', m)
    } finally {
        await conn.loading(m, conn, true)
    }
}
handler.help = ['toimg']
handler.tags = ['sticker']
handler.command = /^(to(img|image))$/i
export default handler