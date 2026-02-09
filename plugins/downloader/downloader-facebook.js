import axios from "axios"
const regex = /^https?:\/\/(?:www\.)?facebook\.com/i

const handler = async (m, { conn, usedPrefix, command, args }) => {
  try {
    if (!args[0]) return m.reply(`Masukan Link! \n\nContoh: \n${usedPrefix + command} https://www.facebook.com/10000123456789/videos/1234567890/`)
    const isLink = args[0].match(regex)
    if (!isLink && !/facebook-download/i.test(command)) return m.reply("Itu bukan link facebook!")
    await conn.loading(m, conn)
    if (/facebook-download/i.test(command)) {
      return await conn.sendFile(m.chat, args[0], "", "", m)
    }
    const response = await axios.get(global.API("ryhar", "/api/downloader/facebook", { url: args[0] }, "apikey"))
    const { result } = response.data
    if (result.length > 1) {
      const list = result.map((v, i) => {
        return [`${usedPrefix}facebook-download ${v.link}`, (i + 1).toString(), v.quality]
      })
      await conn.textList(m.chat, `Terdapat *${result.length} Hasil* \nSilahkan pilih salah satu!`, result[0].link, list, m)
    } else {
      await conn.sendFile(m.chat, result[0].link, null, "*Facebook Downloader*", m)
    }
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["facebook"]
handler.tags = ["downloader"]
handler.command = /^(fb|facebook(dl)?)$/i
handler.limit = true
export default handler
