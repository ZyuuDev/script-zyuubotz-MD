import fs from "fs"
let handler = async (m, { conn, text }) => {
  const data = JSON.parse(fs.readFileSync("./json/faktaunik.json"))
  const dataRantom = data[Math.floor(Math.random() * data.length)]
  m.reply(`*Tahu Gasih :*\n\n${dataRantom}`)
}
handler.help = ["tahugasih"]
handler.tags = ["internet"]
handler.command = /^(taugasih|tahugasih)$/i
handler.limit = true
export default handler
