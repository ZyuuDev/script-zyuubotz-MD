import fetch from 'node-fetch'
import fs from 'fs'
let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) return m.reply(`Masukan Nama Character!\n\nExample\n${usedPrefix + command} Hu Tao`)
        await conn.loading(m, conn)
        let api = await fetch(`https://genshin-db-api.vercel.app/api/characters?query=${text}&matchCategories=true&dumpResult=true&queryLanguages=English&resultLanguage=Indonesian`)
        let { match } = await api.json()
        let footer = '\n\n_*Note :* Build Bisa Berubah Kapan Saja Sesuai Dengan Patch_'
        let data = JSON.parse(fs.readFileSync('./json/buildgi.json', 'utf-8'))
        let image = data.find(v => v.name == match)
        for (let v of image.url) {
            await conn.sendFile(m.chat, v, null, "Build Character " + match + footer, m)
            await delay(1000)
        }
    } finally {
        await conn.loading(m, conn, true)
    }
}
handler.help = ['buildgi']
handler.tags = ['genshin']
handler.command = /^(build(gi|genshin))$/i
handler.onlyprem = true
handler.limit = true
export default handler

const delay = time => new Promise(res => setTimeout(res, time))