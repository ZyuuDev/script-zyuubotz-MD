import axios from "axios"
let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) return m.reply(`Masukan URL!\n\nContoh:\n${usedPrefix + command} https://sck.io/p/jiv-dwZX`)
    await conn.loading(m, conn)
    let response = await axios.get(API("ryhar", "/api/downloader/snackvideo", { url: text }, "apikey"))
    const { result } = response.data
    await conn.sendFile(m.chat, result.downloadUrl, null, "Ini Dia Kak", m)
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["snackvideo"]
handler.tags = ["downloader"]
handler.command = /^(snackvid(io|eo)?)$/i
handler.limit = true
export default handler
