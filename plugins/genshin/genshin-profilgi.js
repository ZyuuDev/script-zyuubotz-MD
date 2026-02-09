import fetch from "node-fetch"
import Jimp from "jimp"

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) return m.reply(`Masukan uid genshin! \n\nContoh : \n${usedPrefix + command} 828342426`)
    if (isNaN(text)) return m.reply("Hanya berupa angka!")
    await conn.loading(m, conn)
    const src = await (await fetch(`https://enka.network/api/uid/${text}/`)).json()
    const teks = `
❃ Nickname : ${src.playerInfo.nickname}
❃ Signature : ${src.playerInfo.signature ? src.playerInfo.signature : "Tidak Ada Signature"}
❃ Adventure Level : ${src.playerInfo.level}

❃ World Level : ${src.playerInfo.worldLevel ? src.playerInfo.worldLevel : "0"}
❃ Archievment : ${src.playerInfo.finishAchievementNum}
❃ Abyss : Floor ${src.playerInfo.towerFloorIndex ? src.playerInfo.towerFloorIndex : "0"} Chamber ${src.playerInfo.towerLevelIndex ? src.playerInfo.towerLevelIndex : "0"}

❃ Open In Enkanetwork : https://enka.network/u/${text}
`.trim()
    const screenshot = global.API("ryhar", "/api/tools/ssweb", { url: `https://enka.network/u/${text}`, device: "desktop" }, "apikey")
    const { filename } = await conn.getFile(screenshot, true)
    const image = await Jimp.read(filename)
    const crop = await image.crop(310, 350, 1300, 535).getBufferAsync("image/png")
    await conn.sendFile(m.chat, crop, "profilgenshin.jpg", teks, m)
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["profilgi"]
handler.tags = ["genshin"]
handler.command = /^profilgenshin|profilgi|profilegi|profilgi$/i
handler.limit = true
export default handler
