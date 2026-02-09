let handler = async (m, { conn, usedPrefix, command, args }) => {
  try {
    if (args.length < 1 || !args[0].startsWith("http")) return m.reply(`Masukan Urls yang benar! \n\nContoh : \n${usedPrefix + command} https://google.com dekstop`)
    const screen = type.find((v) => v === args[1])
    if (!screen)
      return m.reply(
        "Masukan tipe layar yang benar\n\n" +
          type
            .map((v) => {
              return `*•* ${v}`
            })
            .join("\n")
      )
    await conn.loading(m, conn)
    const screenshot = await global.API("ryhar", "/api/tools/ssweb", { url: args[0], device: screen }, "apikey")
    await conn.sendFile(m.chat, screenshot, false, `Link : ${args[0]}`, m)
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["ssweb"]
handler.tags = ["internet"]
handler.command = /^(screenshot(web(site)?)|ss(web(site)?))$/i
handler.limit = true
export default handler

const type = ["mobile", "tablet", "dekstop"]
