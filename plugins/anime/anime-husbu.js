import fs from "fs"
let handler = async (m, { conn, command }) => {
  try {
    await conn.loading(m, conn)
    const data = JSON.parse(fs.readFileSync("./json/husbu.json"))
    const randomData = data[Math.floor(Math.random() * data.length)]
    await conn.sendFile(m.chat, randomData.url, "husbu.jpeg", "*Husbu*", m)
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.command = /^(husbu)$/i
handler.tags = ["anime"]
handler.help = ["husbu"]
handler.premium = false
handler.limit = true

export default handler
