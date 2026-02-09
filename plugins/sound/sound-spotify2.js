import axios from "axios"

const handler = async (m, { conn, text, usedPrefix, command, isPrems }) => {
  try {
    if (!text) return m.reply(`Masukan judul lagu atau link spotify! \n\nContoh : \n${usedPrefix + command} rewrite the star \n${usedPrefix + command} https://open.spotify.com/track/65fpYBrI8o2cfrwf2US4gq`)
    await conn.loading(m, conn)
    const response = await axios.get(global.API("ryhar", "/api/internet/spotify", { q: text }, "apikey"))
    const { result } = response.data
    const { external_urls, name, artists, album, duration_ms, popularity, id } = result.tracks.items[0]
    const caption = `
_*${name}*_

Artist : ${artists[0].name}
Duration : ${convertMsToMinSec(duration_ms)}
Popularity : ${popularity}
Id : ${id}

Album Info :
• Name : ${album.name}
• Release : ${album.release_date}
• Id : ${album.id}
`.trim()
    const chat = await conn.sendFile(m.chat, "https://external-content.duckduckgo.com/iu/?u=" + album.images[0].url, false, caption, m, false, false, { smlcap: true, except: [id, album.id] })
    const response2 = await axios.get(global.API("ryhar", "/api/downloader/spotify", { url: external_urls.spotify }, "apikey"))
    const { result: result2 } = response2.data
    await conn.sendFile(m.chat, result2.audio, null, null, chat, false, { mimetype: "audio/mpeg" })
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["spotify2"]
handler.tags = ["sound"]
handler.command = /^spotify2$/i
handler.onlyprem = true
handler.limit = true
export default handler

function convertMsToMinSec(ms) {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}
