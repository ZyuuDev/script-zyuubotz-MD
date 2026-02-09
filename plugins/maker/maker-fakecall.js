import uploadFile from "../../lib/uploadFile.js"
import fs from "fs"

let handler = async (m, { conn, text: textInput, usedPrefix, command }) => {
  try {
    const [name, duration] = textInput.split("|").map((v) => v.trim())
    if (!name || !duration) return m.reply(`Masukan text! \n\nContoh: \n${usedPrefix + command} Ryhar|20 Minutes`)

    await conn.loading(m, conn)

    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ""
    let pp = false

    if (!mime) {
      try {
        pp = await conn.profilePictureUrl(m.sender, "image")
      } catch {
        pp = fs.readFileSync("./src/avatar_contact.png")
      }
    }

    if (!/image\/(jpe?g|png)/.test(mime) && !pp) return m.reply(`*Format ${mime} tidak didukung!*`)

    await conn.loading(m, conn)

    const img = pp ? await (await conn.getFile(pp)).data : await q.download()
    const files = await uploadFile(img)

    const result = global.API("ryhar", "/api/maker/fakecall", { url: files, name, duration }, "apikey")

    await conn.sendFile(m.chat, result, null, "Ini Dia Kak", m)
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["fakecall"]
handler.tags = ["maker"]
handler.command = /^(fakecall)$/i
handler.limit = true
export default handler
