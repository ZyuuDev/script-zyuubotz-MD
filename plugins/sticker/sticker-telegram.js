import { stickerTele } from '../../lib/scrape.js'
import { sticker } from '../../lib/sticker.js'

let handler = async (m, { conn, usedPrefix, command, text }) => {
    try {
        if (!text) return m.reply(`Masukan Query! \n\nContoh: \n${usedPrefix + command} Anime`)
        await conn.loading(m, conn)
        let data = await stickerTele(text)
        if (typeof data == "undefined") {
            data = await stickerTele(text)
        }
        let result = data.getRandom()
        let stiker = await sticker(false, result.stickers.getRandom(), global.config.stickpack, global.config.stickauth)
        m.reply(stiker)
    } finally {
        await conn.loading(m, conn, true)
    }
}
handler.help = ["stele"]
handler.tags = ["sticker"]
handler.command = /^((s|stiker|sticker)(tele(gram)?))$/i
export default handler