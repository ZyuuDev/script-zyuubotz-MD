import axios from "axios"
import { ephemeral } from "../../lib/func.js"
import { fetchData } from "../../lib/func.js"

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Masukan Link Youtube!\n\nContoh:\n${usedPrefix + command} https://www.youtube.com/watch?v=6hQVWfl9N8w`)
  if (!text.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?/g)) return m.reply("Itu bukan link Youtube!")
  if (!conn.youtube) conn.youtube = {}
  if (conn.youtube[text]) return m.reply("Sedang mendownload video, silahkan tunggu sebentar")
  conn.youtube[text] = true
  try {
    await conn.loading(m, conn)
    const res = await fetchData(global.API("ryhar", "/downloader/youtube-video", { url: text }, "apikey"))
    const result = res.data

    const buffer = await conn.getFile(result.link)
    const fileSize = buffer.data.length
    const caption = `
*Berhasil Mendownload Video dari Youtube!*

*Judul :* ${result.title}
*Duration :* ${result.duration}
*Upload Date :* ${result.uploadDate}
*Views :* ${result.views}
*Size :* ${result.size}
`.trim()
    const chat = await conn.adReply(m.chat, caption, result.title, result.description, result.thumbnail, text, m)
    if (fileSize / 1024 / 1024 > 50) {
      await conn.sendMessage(m.chat, { document: buffer.data, fileName: result.title, mimetype: buffer.mime }, { quoted: chat, ephemeralExpiration: ephemeral(conn, m) })
    } else {
      await conn.sendFile(m.chat, buffer.data, result.title, "", chat, false, { mimetype: buffer.mime })
    }
  } catch (err) {
    m.reply("Terjadi kesalahan saat mendownload video.")
    console.log(err)
  } finally {
    await conn.loading(m, conn, true)
    delete conn.youtube[text]
  }
}
handler.help = ["ytmp4"]
handler.tags = ["downloader"]
handler.command = /^((yt|youtube)(mp4|video))$/i
handler.limit = true
export default handler
