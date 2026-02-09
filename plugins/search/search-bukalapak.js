import { BukaLapak } from '../../lib/scrape.js'

let handler  = async (m, { conn, usedPrefix, command, text }) => {
    try {
        if (!text) return m.reply(`Masukan nama barang yang ingin dicari \n\nContoh : \n${usedPrefix + command} Case handphone poco x3 pro`)
        await conn.loading(m, conn)
        let setting = global.db.data.settings[conn.user.jid]
        let ephemeral = conn.chats[m.chat]?.metadata?.ephemeralDuration || conn.chats[m.chat]?.ephemeralDuration || false

        switch (command) {
            case 'bukalapak': {
                let data = await BukaLapak(text)
                let list = data.map((v, i) => {
                    return [`${usedPrefix}bukalapak-detail ${text}|${i}`, (i + 1).toString(), `${v.title.trim()} \nRating : ${v.rating} \nTerjual : ${v.terjual.replace("Terjual", "").trim()}`]
                })
                await conn.textList(m.chat, `Terdapat *${data.length} Result* \nSilahkan pilih barang yang kamu cari dibawah ini!`, false, list, m)
                break
            }
            case 'bukalapak-detail': {
                text = text.split("|")
                let data = await BukaLapak(text[0])
                let caption = `
Title : ${data[text[1]].title}
Harga : ${data[text[1]].harga}
Rating : ${data[text[1]].rating}
Terjual : ${data[text[1]].terjual}

Store Info : 
• Lokasi : ${data[text[1]].store.lokasi}
• Nama : ${data[text[1]].store.nama}
• Link : ${data[text[1]].store.link}

Link : ${data[text[1]].link}
`.trim()
                await conn.sendMessage(m.chat, { image: { url: data[text[1]].image }, fileName: 'bukalapak.jpg', mimetype: 'image/jpeg', caption: setting.smlcap ? conn.smlcap(caption) : caption }, { quoted: m, ephemeralExpiration: ephemeral })
                break
            }
            default:
        }
    } finally {
        await conn.loading(m, conn, true)
    }
}
handler.help = ['bukalapak']
handler.tags = ['search']
handler.command = /^(bukalapak(-detail)?)$/i

export default handler 