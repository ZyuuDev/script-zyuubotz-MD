import { toPDF } from "../../lib/converter.js"
import axios from "axios"
const handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    await conn.loading(m, conn)
    switch (command) {
      case "komiku":
        {
          if (!text) return m.reply(`Masukan nama komik yang kamu cari! \n\nContoh: \n${usedPrefix + command} solo leveling`)
          const response = await axios.get(global.API("ryhar", "/api/anime/komiku-search", { query: text }, "apikey"))
          const { result } = response.data
          if (result.length == 0) return m.reply(`Tidak dapat menemukan *${text}*`)
          const list = result.map((v, i) => {
            return [`${usedPrefix}komiku-detail ${v.link}`, (i + 1).toString(), `${v.title} \nKategori : ${v.kategori} \nDi Update Pada ${v.update}`]
          })
          await conn.textList(m.chat, `Terdapat *${result.length} Komik*`, false, list, m)
        }
        break
      case "komiku-detail":
        {
          const response = await axios.get(global.API("ryhar", "/api/anime/komiku-detail", { url: text }, "apikey"))
          const { result } = response.data
          if (!result.judul_komik) return m.reply("Link tidak valid!")
          const caption = `
Title : ${result.judul_komik}
Jenis : ${result.jenis_komik}
Cerita : ${result.konsep_cerita}
Pengarang : ${result.pengarang}
Status : ${result.status}
Genre : ${result.genres.join(", ")}
Cara Baca : ${result.cara_baca}
`.trim()
          const list = result.chapters.map((v, i) => {
            return [`${usedPrefix}komiku-chapter ${v.url}|${v.title}`, (i + 1).toString(), `${v.title} \nDi Upload Pada ${v.date}`]
          })
          await conn.textList(m.chat, caption, result.thumbnail, list, m)
        }
        break
      case "komiku-chapter":
        {
          const [link, title] = text.split("|")
          const response = await axios.get(global.API("ryhar", "/api/anime/komiku-download", { url: link }, "apikey"))
          const { result } = response.data
          if (result.length == 0) return m.reply("Link tidak valid!")
          const imagepdf = await toPDF(result)
          await conn.sendFile(m.chat, imagepdf, title, "", m)
        }
        break
      default:
    }
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["komiku"]
handler.tags = ["anime"]
handler.command = /^(komiku(-detail|-chapter)?)$/i
handler.limit = true
export default handler
