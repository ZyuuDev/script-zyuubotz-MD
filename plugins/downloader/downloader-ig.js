import axios from "axios"
const regex = /^https:\/\/www\.instagram\.com\/[a-zA-Z0-9-_\/?&=]+$/i

const handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    if (!args[0]) return m.reply(`Masukan Urls!\n\nContoh:\n${usedPrefix + command} https://www.instagram.com/p/Cq8o8QZupaE/?igshid=YmMyMTA2M2Y=`)
    const isLink = args[0].match(regex)
    if (!isLink && !/instagram-download/i.test(command)) return m.reply("Itu bukan link instagram!")
    await conn.loading(m, conn)
    if (/instagram-download/i.test(command)) {
      return await conn.sendFile(m.chat, args[0], "", "", m)
    }
    const response = await axios.get(global.API("ryhar", "/downloader/instagram", { url: args[0] }, "apikey"))
    const { data: result } = response.data

    const caption = `
*Instagram Downloader*

Likes: ${result.like}
Comments: ${result.comment}
Uploaded: ${result.uploaded}

${result.caption}
    `.trim()

    if (result.link.length > 1) {
      const list = result.link.map((v, i) => {
        return [`${usedPrefix}instagram-download ${v}`, (i + 1).toString(), `Result ke ${i + 1}`]
      })
      await conn.textList(m.chat, `${caption}\n\nTerdapat *${result.link.length} Hasil* \nSilahkan pilih salah satu!`, result.link[0], list, m)
    } else {
      await conn.sendFile(m.chat, result.link[0], "", caption, m)
    }
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["instagram"]
handler.tags = ["downloader"]
handler.command = /^(instagram(mp4|dl|-download)?|ig(mp4|dl)?)$/i
handler.limit = true
export default handler
