import Jimp from "jimp"
import uploadFile from "../../lib/uploadFile.js"

let handler = async (m, { conn, args }) => {
  try {
    let towidth = args[0]
    let toheight = args[1]
    if (!towidth) return m.reply("size width?")
    if (!toheight) return m.reply("size height?")

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ""
    if (!mime) return m.reply("where the media?")
    let isMedia = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime)
    if (!isMedia) return m.reply(`Mime ${mime} tidak didukung`)
    await conn.loading(m, conn)
    let media = await q.download()
    let link = await uploadFile(media)

    let source = await Jimp.read(link)
    let size = {
      before: {
        height: await source.getHeight(),
        width: await source.getWidth(),
      },
      after: {
        height: toheight,
        width: towidth,
      },
    }
    let resized = await conn.resize(link, size.after.width, size.after.height)
    let linkresized = await uploadFile(resized)

    await conn.sendFile(
      m.chat,
      resized,
      null,
      `*––––––『 COMPRESS RESIZE 』––––––*

*• BEFORE*
> Width : ${size.before.width}
> Height : ${size.before.height}

*• AFTER*
> Width : ${size.after.width}
> Height : ${size.after.height}

*• LINK*
> Link Original : ${link}
> Link Resized : ${linkresized}`,
      m
    )
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["resize"]
handler.tags = ["tools"]
handler.command = /^(resize)$/i

export default handler
