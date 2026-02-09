import archiver from "archiver"
import moment from "moment-timezone"
import fs from "fs"

let handler = async (m, { conn }) => {
  const filename = `backupsc-${moment.tz("Asia/Jakarta").format("DD-MM-YYYY-HH-mm-ss")}.zip`

  try {
    const output = fs.createWriteStream(filename)
    const archive = archiver("zip", {
      zlib: { level: 9 },
    })

    output.on("close", async () => {
      await conn.reply(m.chat, `Selesai. Total ${archive.pointer()} byte`, m), await conn.sendFile(m.chat, filename, "backupsc.zip", "", m)
      fs.unlinkSync(filename)
    })

    archive.on("error", (err) => {
      throw err
    })

    archive.pipe(output)

    const sourceFolder = "./"
    const excludeFolders = ["node_modules", "tmp", "sessions"]

    archive.glob("**/*", {
      cwd: sourceFolder,
      ignore: excludeFolders.map((dir) => `${dir}/**`),
    })

    archive.finalize()
  } catch (e) {
    console.log(e)
    throw e
  }
}

handler.help = ["backupsc"]
handler.tags = ["mods"]
handler.command = /^(backup(script|sc))$/i
handler.mods = true
handler.private = true
export default handler
