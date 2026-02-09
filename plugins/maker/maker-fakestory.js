import uploadFile from "../../lib/uploadFile.js"
import fs from "fs"

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    const [caption, name] = text.split("|").map((v) => v.trim())

    const _name = name || (await conn.getName(m.sender))

    if (!caption) return m.reply(`Masukan text! \n\nContoh: \n${usedPrefix + command} Halo|${_name}`)

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

    const result = global.API("ryhar", "/api/maker/fakestory", { url: files, caption, name: _name }, "apikey")

    await conn.sendFile(m.chat, result, null, "Ini Dia Kak", m)
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["fakestory"]
handler.tags = ["maker"]
handler.command = /^(fakestory)$/i
handler.limit = true
export default handler
