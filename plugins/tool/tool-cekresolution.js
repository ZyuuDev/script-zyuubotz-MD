import Jimp from "jimp"
import uploadFile from "../../lib/uploadFile.js"

let handler = async (m, { conn }) => {
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ""
    if (!mime) return m.reply("where the media?")
    await conn.loading(m, conn)

    let media = await q.download()
    let link = await uploadFile(media)

    let source = await Jimp.read(link)
    let height = await source.getHeight()
    let width = await source.getWidth()

    m.reply(`_*RESOLUTION :*_ ${width} x ${height}

> Width : ${width}
> Height : ${height}

> Link : ${link}`)
  } catch (e) {
    throw e
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["cekresolution"]
handler.tags = ["tools"]
handler.command = /^(cekreso(lution)?)$/i

export default handler
