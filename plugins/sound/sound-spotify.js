import axios from "axios"

let handler = async (m, { conn, text, usedPrefix, command, isPrems }) => {
  try {
    if (!text) return m.reply(`Masukan judul lagu atau link spotify! \n\nContoh : \n${usedPrefix + command} rewrite the star \n${usedPrefix + command} https://open.spotify.com/track/65fpYBrI8o2cfrwf2US4gq`)
    await conn.loading(m, conn)
    if (/http(s)?:\/\/open.spotify.com\/track\/[-a-zA-Z0-9]+/i.test(text)) {
      let response = await axios.get(global.API("ryhar", "/api/downloader/spotify", { url: text }, "apikey"))
      let { result } = response.data
      let caption = `
_*${result.name}*_

Artist : ${result.artists[0].name}
Duration : ${convertMsToMinSec(result.duration_ms)}
Popularity : ${result.popularity}
Id : ${result.id}

Album Info :
• Name : ${result.album.name}
• Release : ${result.album.release_date}
• Id : ${result.album.id}
`.trim()
      let chat = await conn.sendFile(m.chat, "https://external-content.duckduckgo.com/iu/?u=" + result.album.images[0].url, false, caption, m, false, false, { smlcap: true, except: [result.id, result.album.id] })
      await conn.sendFile(m.chat, result.audio, null, null, chat, false, { mimetype: "audio/mpeg" })
    } else {
      let response = await axios.get(global.API("ryhar", "/api/internet/spotify", { q: text }, "apikey"))
      let { result } = response.data
      let list = result.tracks.items.map((v, i) => {
        return [`${usedPrefix + command} ${v.external_urls.spotify}`, (i + 1).toString(), `${v.name} \nArtist By ${v.artists[0].name}`]
      })
      await conn.textList(m.chat, `Terdapat *${result.tracks.items.length} Hasil* \nSilahkan pilih lagu yang kamu mau!`, false, list, m, {
        contextInfo: {
          externalAdReply: {
            showAdAttribution: false,
            mediaType: 1,
            title: result.tracks.items[0].name,
            body: `Artist By ${result.tracks.items[0].artists[0].name}`,
            thumbnail: (await conn.getFile("https://external-content.duckduckgo.com/iu/?u=" + result.tracks.items[0].album.images[0].url)).data,
            renderLargerThumbnail: true,
            mediaUrl: result.tracks.items[0].external_urls.spotify,
            sourceUrl: result.tracks.items[0].external_urls.spotify,
          },
        },
      })
    }
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["spotify"]
handler.tags = ["sound"]
handler.command = /^spotify$/i
handler.onlyprem = true
handler.limit = true
export default handler

function convertMsToMinSec(ms) {
  let seconds = Math.floor(ms / 1000)
  let minutes = Math.floor(seconds / 60)
  let remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}
