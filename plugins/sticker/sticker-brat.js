import { sticker } from "../../lib/sticker.js"

let handler = async (m, { conn, command, usedPrefix, text }) => {
  try {
    if (!text) {
      text = m.quoted ? m.quoted.text : ""
      if (!text) return m.reply(`Masukan Text! \n\nContoh : \n${usedPrefix + command} Hello World | white | black`)
    }

    const [message, backgroundColor, textColor] = text.split("|").map((str) => str.trim())
    await conn.loading(m, conn)

    let image = global.API("ryhar", "/maker/brat", { text: message, backgroundColor: backgroundColor ? backgroundColor : "white", textColor: textColor ? textColor : "black" }, "apikey")

    let stiker = await sticker(image, false, global.config.stickpack, global.config.stickauth)
    await conn.sendFile(m.chat, stiker, "", "", m)
  } finally {
    await conn.loading(m, conn, true)
  }
}

handler.help = ["brat"]
handler.tags = ["sticker"]
handler.command = /^(brat)$/i
handler.limit = true

export default handler
