import { resep } from "../../lib/scrape.js"
let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    if (!text) return conn.reply(m.chat, `Masukan Format Dengan Benar\n\nContoh: \n${usedPrefix + command} Ayam Geprek`)
    await conn.loading(m, conn)
    switch (command) {
      case "cariresep":
      case "resep": {
        let { data } = await resep.search(text)
        let list = data.map((v, i) => {
          return [`${usedPrefix}resep-detail ${v.link}`, (i + 1).toString(), v.judul]
        })
        await conn.textList(m.chat, `Terdapat *${data.length} Resep* \nSilahkan pilih Resep yang kamu cari dibawah ini!`, false, list, m)
        break
      }
      case "resep-detail": {
        let { data } = await resep.detail(text)
        let caption = `
▧ Judul: ${data.judul}

▧ Waktu Masak: ${data.waktu_masak}
▧ Hasil: ${data.hasil}
▧ Tingkat Kesulitan: ${data.tingkat_kesulitan}

▧ Bahan:
${data.bahan}

▧ Langkah Langkah:
${data.langkah_langkah}
`.trim()
        await conn.sendFile(m.chat, data.thumb, data.judul + ".jpeg", caption, m)
        break
      }
      default:
    }
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["cariresep"]
handler.tags = ["search"]
handler.command = /^(cariresep|resep(-detail)?)$/i
handler.limit = true
export default handler
