import fetch from "node-fetch"

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) return m.reply(`Masukan Url!\n\nContoh:\n${usedPrefix + command} https://www.smule.com/recording/lewis-capaldi-someone-you-loved/2027750707_2937753991`)
    await conn.loading(m, conn)
    let response = await fetch(global.API("ryhar", "/api/downloader/smule", { url: text }, "apikey"))
    let { result } = await response.json()
    const caption = `
Title : ${result.title}

${result.description}
        `.trim()
    const videoUrl = result.downloadOptions.find((v) => v.text === "video").url
    const audioUrl = result.downloadOptions.find((v) => v.text === "audio").url
    let video = await conn.sendFile(m.chat, videoUrl, false, caption, m)
    await conn.sendFile(m.chat, audioUrl, false, false, video, false, { mimetype: "audio/mpeg" })
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["smule"]
handler.tags = ["downloader"]
handler.command = /^smule$/i
handler.limit = true
export default handler
