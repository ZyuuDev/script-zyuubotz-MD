import axios from "axios"

let handler = async (m) => {
  try {
    const { data } = await axios.get(global.API("ryhar", "/api/internet/jadwalbola", {}, "apikey"))

    const result = data?.result || []

    if (!result.length) {
      return m.reply("❌ Jadwal bola tidak ditemukan.")
    }

    const caption = result
      .map((v) => {
        const matchList = v.matches.map((vv) => `KickOff: ${vv.kickOff}\nMatch: ${vv.match}\nCompetition: ${vv.competition}\nTv: ${vv.tv}`).join("\n\n")
        return `*${v.title}*\n${matchList}`
      })
      .join("\n\n")

    const teks = `*Jadwal Bola*\n\n${caption}`
    m.reply(teks)
  } catch (e) {
    console.error(e)
    m.reply("⚠️ Gagal mengambil data jadwal bola.")
  }
}

handler.help = ["jadwalbola"]
handler.tags = ["internet"]
handler.command = /^jadwalbola$/i

export default handler
