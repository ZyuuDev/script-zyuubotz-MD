import axios from "axios"
import uploadFile from "../../lib/uploadFile.js"

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    if (!conn.hdvideo) conn.hdvideo = {}
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ""
    if (!mime) return m.reply(`Balas video dengan caption ${usedPrefix + command}`)
    if (!/video\/(mp4|webm|mkv|ogg|avi|flv|mov|wmv)/i.test(mime)) return m.reply("Hanya Support Video!")
    if (q.seconds > 30) return m.reply("Ukuran Video Tidak Boleh Lebih Dari 30 Detik!")
    if (!conn.hdvideo[m.sender]) conn.hdvideo[m.sender] = true
    await conn.loading(m, conn)
    const videoBuffer = await q.download()
    const url = await uploadFile(videoBuffer)
    const res = await axios.get(global.API("ryhar", "/api/ai/hdvideo", { url }, "apikey"))
    const resultBuffer = await conn.getFile(res.data.result.url)
    const sizeInBytes = resultBuffer.data.byteLength
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2)
    const ephemeral = conn.chats[m.chat]?.metadata?.ephemeralDuration || conn.chats[m.chat]?.ephemeralDuration || false
    if (sizeInMB > 30) await conn.sendMessage(m.chat, { document: resultBuffer.data, fileName: "hdvideo.mp4", mimetype: "video/mp4" }, { quoted: m, ephemeralExpiration: ephemeral })
    else await conn.sendFile(m.chat, resultBuffer.data, "hdvideo.mp4", "Ini Dia Kak", m)
  } finally {
    await conn.loading(m, conn, true)
    conn.hdvideo[m.sender] = false
  }
}

handler.help = ["hdvideo"]
handler.tags = ["premium", "ai"]
handler.command = /^(hdvideo)$/i
export default handler
