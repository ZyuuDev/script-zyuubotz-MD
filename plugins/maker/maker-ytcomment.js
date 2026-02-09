let handler = async (m, { senderKey, conn, text, usedPrefix, command }) => {
    try {
        if (!text) return m.reply(`Masukan text! \n\nContoh: \n${usedPrefix + command} Halo`)
        await conn.loading(m, conn)
        await conn.sendFile(m.chat, global.API('https://some-random-api.ml', '/canvas/youtube-comment', {
            avatar: await conn.profilePictureUrl(senderKey).catch(_ => ''),
            comment: text,
            username: m.pushName
        }), 'yt-comment.png', 'Here is your comment', m)
    } catch (e) {
        throw e
    } finally {
        await conn.loading(m, conn, true)
    }
}

handler.help = ['ytcomment']
handler.tags = ['internet']
handler.command = /^(ytcomment)$/i
handler.limit = true

export default handler