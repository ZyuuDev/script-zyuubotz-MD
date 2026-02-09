import uploadFile from "../../lib/uploadFile.js"
import fs from "fs"

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    const [comment, displayName, username] = text.split("|").map((v) => v.trim())

    const _displayName = displayName || (await conn.getName(m.sender))
    const _username = username || "@" + _displayName.toLowerCase().replace(/ /g, "_")

    if (!comment) return m.reply(`Masukan text! \n\nContoh: \n${usedPrefix + command} Halo|${_displayName}|${_username}`)

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

    const result = global.API("ryhar", "/api/maker/faketweet", { url: files, comment, displayName: _displayName, name: _username }, "apikey")

    await conn.sendFile(m.chat, result, null, "Ini Dia Kak", m)
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["faketweet"]
handler.tags = ["maker"]
handler.command = /^(faketweet)$/i
handler.limit = true
export default handler
