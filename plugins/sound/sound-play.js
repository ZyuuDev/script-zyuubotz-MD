import { ytSearch } from "../../lib/scrape.js"
let handler = async (m, { conn, text, isPrems, isOwner, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukan query! \n\nContoh: \n${usedPrefix + command} mantra hujan`)
    try {
        await conn.loading(m, conn)
        let { title, uploaded, duration, views, url, thumbnail } = (await ytSearch(text))[0]
        let caption = `
*––––––『 P L A Y 』––––––*

🎧 *Title:* ${title.trim()}
📤 *Published:* ${uploaded}
⏰ *Duration:* ${duration}
👁️ *Views:* ${views}

🔗 *Url:* ${url}

*L O A D I N G. . .*
`.trim()
        await conn.textOptions(m.chat, caption, false, [[`${usedPrefix}ytmp3 ${url}`, "Audio"], [`${usedPrefix}ytmp4 ${url}`, "Video"]], m, {
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: false,
                    mediaType: 1,
                    title: title.trim(),
                    body: null,
                    thumbnail: (await conn.getFile(thumbnail)).data,
                    renderLargerThumbnail: true,
                    mediaUrl: url,
                    sourceUrl: url
                }
            }
        })
    } catch (e) {
    	m.reply(`Tidak dapat menemukan query "${text}"`)
    	console.error(e)
    } finally {
        await conn.loading(m, conn, true)
    }
}
handler.help = ['play']
handler.tags = ['sound']
handler.command = /^play$/i
handler.limit = true
export default handler