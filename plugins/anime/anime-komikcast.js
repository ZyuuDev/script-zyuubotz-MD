import { Komikcast } from "../../lib/scrape.js"
import { extractImageThumb } from "@whiskeysockets/baileys"
import { toPDF } from '../../lib/converter.js'
let komikcast = new Komikcast()
let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    switch (command) {
      case 'komikcast': {
        if (!text) return m.reply(`Masukan nama komik yang kamu cari! \n\nContoh: \n${usedPrefix + command} solo leveling`)
        await conn.loading(m, conn)
        let result = await komikcast.search(text)
        if (result.length == 0) return m.reply(`Tidak dapat menemukan *${text}* silahkan periksa kembali kata kunci anda`)
        let list = result.map((v, i) => {
          return [`${usedPrefix}komikcast-detail ${v.link}`, (i + 1).toString(), `${v.title} \nType : ${v.type} \nChapter : ${v.chapter}`]
        })
        await conn.textList(m.chat, `Terdapat *${result.length} Komik*`, false, list, m)
      }
        break
      case "komikcast-detail": {
        await conn.loading(m, conn)
        let result = await komikcast.detail(text)
        let caption = `
Title : ${result.title}
Genres : ${result.genres.join(", ")}
Release : ${result.released} ${result.author ? `
Author : ${result.author}` : ""}
Status : ${result.status}
Type : ${result.type}

Synopsis :
${result.synopsis}
`.trim()
        let list = result.chapters.map((v, i) => {
          return [`${usedPrefix}komikcast-chapter ${v.url}`, (i + 1).toString(), `${v.number} \n${v.timeAgo}`]
        })
        await conn.textList(m.chat, caption, result.image, list, m)
      }
        break
      case "komikcast-chapter": {
        await conn.loading(m, conn)
        let result = await komikcast.chapter(text)
        let images = result.images.map(v => {
          return "https://external-content.duckduckgo.com/iu/?u=" + v
        })
        let { data } = await conn.getFile(result.images[0])
        let jpegThumbnail = await extractImageThumb(data)
        let imagepdf = await toPDF(images)
        await conn.sendFile(m.chat, imagepdf, result.title, "", m)
      }
        break
      default:
    }
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["komikcast"]
handler.tags = ["anime"]
handler.command = /^(komikcast(-detail|-chapter)?)$/i
handler.limit = true
export default handler