let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) return m.reply(`Masukan Text Nya!\n\nContoh:\n${usedPrefix + command} Alok`)
        await conn.loading(m, conn)
        let res = API('lol', '/api/ephoto1/freefire', { text: text }, 'apikey')
        await conn.sendFile(m.chat, res, 'error.jpg', 'Ini Dia Kak', m)
    } catch (e) {
        throw e
    } finally {
        await conn.loading(m, conn, true)
    }
}
handler.help = ['bannerff']
handler.tags = ['maker']
handler.command = /^(bannerff)$/i
handler.limit = true
export default handler