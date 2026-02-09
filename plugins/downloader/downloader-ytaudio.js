import axios from "axios"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukan Link Youtube!\n\nContoh:\n${usedPrefix + command} https://www.youtube.com/watch?v=6hQVWfl9N8w`)
    if (!text.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?/g)) return m.reply("Itu bukan link Youtube!")
    if (!conn.youtube) conn.youtube = {}
    if (conn.youtube[text]) return m.reply("Sedang mendownload audio, silahkan tunggu sebentar")
    conn.youtube[text] = true
    try {
        await conn.loading(m, conn)
        const res = await axios.get(global.API("ryhar", "/api/downloader/youtube-audio", { url: text }, "apikey"))
        if (!res.status) throw res.message
        const { result } = res.data
        const caption = `
*Berhasil Mendownload Audio dari Youtube!*

Judul : ${result.title}
Duration : ${result.duration}
Upload Date : ${result.uploadDate}
Views : ${result.views}
Size : ${result.size}
`.trim()
        const chat = await conn.adReply(m.chat, caption, result.title, result.description, result.thumbnail, text, m)
        await conn.sendFile(m.chat, result.link, "", "", chat, false, { mimetype: "audio/mpeg" })
    } finally {
        await conn.loading(m, conn, true)
        delete conn.youtube[text]
    }
}
handler.help = ["ytmp3"]
handler.tags = ["downloader"]
handler.command = /^((yt|youtube)(mp3|audio))$/i
handler.limit = true
export default handler