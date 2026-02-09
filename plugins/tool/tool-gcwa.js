import axios from "axios"
let handler = async (m, { text, usedPrefix, command }) => {
  try {
    if (!text) return m.reply(`Masukan nama group! \n\nContoh : \n${usedPrefix + command} anime`)
    await conn.loading(m, conn)
    const res = await axios.get(global.API("ryhar", "/api/internet/groupwa", { q: text }, "apikey"))
    if (!res.data.success) return m.reply(res.data.message)
    if (res.data.result.length > 0) {
      const caption = res.data.result
        .map((v) => {
          const data = Object.entries(v)
            .filter(([key, value]) => !/image/.test(key))
            .map(([key, value]) => {
              return `${capitalize(key)}: ${key === "tags" ? value.join(", ") : value || "-"}`
            })
          return data.join("\n")
        })
        .join("\n\n")

      m.reply(caption)
    } else m.reply("Group Tidak Ditemukan")
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["gcwa"]
handler.tags = ["tools"]
handler.command = /^((group(wa)?|gcwa)(-link)?)$/i
handler.limit = true
export default handler

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
