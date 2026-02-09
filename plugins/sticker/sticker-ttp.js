import { sticker } from "../../lib/sticker.js"

let handler = async (m, { conn, command, usedPrefix, text }) => {
  try {
    text = m.quoted && !text ? m.quoted.text : text
    if (!text) return m.reply(`Masukan Text! \n\nContoh : \n${usedPrefix + command} Elaina Waifu Saya`)
    await conn.loading(m, conn)
    let image = global.API("lol", "/api/ttp", { text: text }, "apikey")
    let stiker = await sticker(image, false, global.config.stickpack, global.config.stickauth)
    await conn.sendFile(m.chat, stiker, "", "", m)
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["ttp"]
handler.tags = ["sticker"]
handler.command = /^(ttp)$/i
handler.limit = true
export default handler
