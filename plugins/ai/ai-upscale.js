import axios from "axios"
import uploadFile from "../../lib/uploadFile.js"
import { fetchData } from "../../lib/func.js"

const handler = async (m, { conn }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ""
  if (!mime) return m.reply("Fotonya Mana? Reply gambar atau upload")
  if (!/image\/(jpe?g|png)/.test(mime)) return m.reply(`Tipe ${mime} tidak didukung!`)
  try {
    await conn.loading(m, conn)
    const imageBuffer = await q.download()
    const imageUrl = await uploadFile(imageBuffer)
    const result = await fetchData(global.API("ryhar", "/ai/enhance", { url: imageUrl }, "apikey"))
    await conn.sendFile(m.chat, result.data.result_url, "", "Ini Dia Kak", m)
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["upscale"]
handler.tags = ["ai"]
handler.command = /^(upscale|hd|remini)$/i
handler.limit = true
export default handler