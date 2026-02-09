import fetch from "node-fetch"

let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) return m.reply(`Masukan Nama Mahasiswa! \n\nContoh: \n${usedPrefix + command} Bayu Pratama`)
    let request = await fetch(global.API("https://api-frontend.kemdikbud.go.id", `/hit_mhs/${text}`,))
    let json = await request.json()
    m.reply(json.mahasiswa.map(v => v.text).join("\n\n"))
}
handler.help = ["mahasiswa"]
handler.tags = ["info"]
handler.command = /^(mahasiswa)$/i
export default handler 