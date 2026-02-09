let handler = async (m, { conn, usedPrefix, command, args }) => {
    try {
        if (!args[0]) return m.reply(`Masukan link Pixeldrain \n\nContoh: \n${usedPrefix + command} https://pixeldrain.com/u/7kNWhxQM`)
        await conn.loading(m, conn)
        let kode = args[0].replace(/http:\/\/|https:\/\//gi, "").split("/")[2]
        let file = await conn.getFile("https://pixeldrain.com/api/file/" + kode)
        let ephemeral = conn.chats[m.chat]?.metadata?.ephemeralDuration || conn.chats[m.chat]?.ephemeralDuration || false
        await conn.sendMessage(m.chat, { document: file.data, fileName: (args[1] ? args[1] : "Pixeldrain Downloader") + file.ext, mimetype: file.mime }, { quoted: m, ephemeralExpiration: ephemeral })
    } finally {
        await conn.loading(m, conn, true)
    }
}
handler.help = ["pixeldrain"]
handler.tags = ["downloader"]
handler.command = /^(pixeldrain)$/i
handler.limit = true
export default handler