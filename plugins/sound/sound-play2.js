import { ytSearch } from "../../lib/scrape.js"
import axios from "axios"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukan query! \n\nContoh: \n${usedPrefix + command} mantra hujan`)
    try {
        await conn.loading(m, conn)
        const { title, uploaded, duration, views, url, thumbnail } = (await ytSearch(text))[0]
        const caption = `
*––––––『 P L A Y 』––––––*

🎧 *Title:* ${title.trim()}
📤 *Published:* ${uploaded}
⏰ *Duration:* ${duration}
👁️ *Views:* ${views}

🔗 *Url:* ${url}

*L O A D I N G. . .*
`.trim()
        const chat = await conn.adReply(m.chat, caption, title, "Youtube Player", thumbnail, text, m)
        const res = await axios.get(global.API("ryhar", "/api/downloader/youtube-audio", { url: url }, "apikey"))
        if (!res.status) throw res.message
        const { result } = res.data
        await conn.sendFile(m.chat, result.link, "", "", chat, false, { mimetype: "audio/mpeg" })
    } catch (e) {
        m.reply(`Tidak dapat menemukan query "${text}"`)
        console.error(e)
    } finally {
        await conn.loading(m, conn, true)
    }
}
handler.help = ['play2']
handler.tags = ['sound']
handler.command = /^play2$/i
handler.limit = true
export default handler