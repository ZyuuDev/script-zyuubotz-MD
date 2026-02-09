import fs from "fs"
let handler = async (m, { conn, text }) => {
  m.reply("Tunggu Sebentar, Sedang mengambil file Database")
  let sesi = fs.readFileSync("./database.json")
  return await conn.sendMessage(m.chat, { document: sesi, mimetype: "application/json", fileName: "database.json" }, { quoted: m })
}
handler.help = ["getdb"]
handler.tags = ["mods"]
handler.command = /^(getdb)$/i
handler.mods = true
export default handler
