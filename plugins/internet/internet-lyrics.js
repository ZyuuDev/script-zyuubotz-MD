import axios from "axios"

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Masukan judul lagu! \n\nContoh: \n${usedPrefix + command} The Weeknd - Blinding Lights`)
  try {
    await conn.loading(m, conn)
    switch (command) {
      case "lyrics": {
        const response = await axios.get(global.API("ryhar", "/api/internet/lyrics-search", { q: text }, "apikey"))
        const result = response.data.result
        if (result.length > 0) {
          const list = result.map((v, i) => {
            return [`${usedPrefix}lyrics-details ${v.link}`, (i + 1).toString(), `*${v.title}* \nArtis: ${v.artist}`]
          })
          await conn.textList(m.chat, `Terdapat *${result.length} Result!*`, false, list, m, {
            contextInfo: {
              externalAdReply: {
                showAdAttribution: false,
                mediaType: 1,
                title: result[0].title,
                body: result[0].artist,
                thumbnail: (await conn.getFile(result[0].image.replace("40x40bb", "500x500bb"))).data,
                renderLargerThumbnail: true,
                mediaUrl: result[0].link,
                sourceUrl: result[0].link,
              },
            },
          })
        }
        break
      }
      case "lyrics-details": {
        const response = await axios.get(global.API("ryhar", "/api/internet/lyrics-detail", { url: text }, "apikey"))
        const result = response.data.result
        const caption = `
*Lyrics* :

${result.lyrics.map((v) => {
  return `*${/[Lyrics]/.test(v.section) ? "" : `${v.section}\n\n`}* ${v.lines.map((vv) => vv.trim()).join("\n")}`
})}
                `.trim()
        await conn.adReply(m.chat, caption, result.album.title, result.album.artist, result.album.cover.replace("400x400bb", "500x500bb"), text, m)
        break
      }
    }
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["lyrics"]
handler.tags = ["internet"]
handler.command = /^(lyrics(-details)?)$/i
handler.limit = true
export default handler
