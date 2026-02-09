import fetch from "node-fetch"

let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) return m.reply(`Masukan Nama Sekolah! \n\nContoh: \n${usedPrefix + command} Xaverius`)
    if (isNumber(text)) {
        let request = await fetch(global.API("https://api-sekolah-indonesia.vercel.app", "/sekolah", { npsn: text }))
        let json = await request.json()
        if (json.status != "success") return m.reply("Tidak Dapat Menemukan Nama Sekolah!")
        m.reply(Object.entries(json.dataSekolah[0]).map(v => `${capitalize(v[0].replace(/_/g, " "))} : ${v[1]}`).join("\n"))
    } else {
        let request = await fetch(global.API("https://api-sekolah-indonesia.vercel.app", "/sekolah/s", { sekolah: text, page: 1, perPage: 100 }))
        let json = await request.json()
        if (json.status != "success") return m.reply("Tidak Dapat Menemukan Nama Sekolah!")
        let list = json.dataSekolah.map((v, i) => {
            return [`${usedPrefix + command} ${v.npsn}`, (i + 1).toString(), `${v.sekolah} \n${v.kabupaten_kota}, ${v.kecamatan}`]
        })
        await conn.textList(m.chat, `Terdapat *${json.dataSekolah.length} Sekolah* \nSilahkan Pilih Data Sekolah Yang Kamu Cari!`, false, list, m)
    }
}
handler.help = ["sekolah"]
handler.tags = ["info"]
handler.command = /^(sekolah)$/i
export default handler

function isNumber(value) {
    value = parseInt(value)
    return typeof value === 'number' && !isNaN(value)
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.substr(1)
}