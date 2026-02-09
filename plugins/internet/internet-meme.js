import { googleImage } from '../../lib/scrape.js'
let handler = async (m, { conn }) => {
    try {
        await conn.loading(m, conn)
        let res = await googleImage('meme indonesia')
        let image = res.getRandom()
        conn.sendFile(m.chat, 'https://external-content.duckduckgo.com/iu/?u=' + image, null, 'Asupan Recehnya Kak', m)
    } catch (e) {
        throw e
    } finally {
        await conn.loading(m, conn, true)
    }
}
handler.help = ['meme']
handler.tags = ['internet']
handler.command = /^(meme)$/i
handler.limit = true
export default handler