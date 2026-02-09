import axios from "axios"

let handler = async (m, { conn, command, usedPrefix, text }) => {
    try {
        switch (command) {
            case "otakudesu": {
                if (!text) return m.reply(`Masukan judul anime atau link otakudesu! \n\nContoh: \n${usedPrefix + command} Naruto Shippuden`)
                    await conn.loading(m, conn)
                if (/http(s)?:\/\/otakudesu.cloud/i.test(text)) {
                    let result = await axios.get(global.API("https://api.siputzx.my.id", "/api/anime/otakudesu/detail", { url: text }))
                    if (!result.data.status) return m.reply("Link yang kamu kirim tidak valid!")
                    const data = result.data.data.animeInfo
                    const episodes = result.data.data.episodes
                    const caption = Object.entries(data).map(([key, value]) => {
                        return `${capitalize(key)}: ${value ?? "Not Available"}`
                    }).join("\n")                    
                    const list = episodes.map((v, i) => {
                        return [`${usedPrefix}otakudesu-download ${v.link}|${v.title}`, (i + 1).toString(), `${v.title} ( ${v.date} )`]
                    })
                    return conn.textList(m.chat, caption, data.imageUrl, list, m)
                }
                let result = await axios.get(global.API("https://api.siputzx.my.id", "/api/anime/otakudesu/search", { s: text }))
                if (!result.data.status) return m.reply("Judul tidak ditemukan!")
                const data = result.data.data
                const list = data.map((v, i) => {
                    return [`${usedPrefix}otakudesu ${v.link}`, (i + 1).toString(), `*${v.title}* \nGenres: ${v.genres} \nRating: ${v.rating} \nStatus: ${v.status}`]
                })
                await conn.textList(m.chat, `Terdapat *${data.length} Result!*`, false, list, m)
                break
            }
            case "otakudesu-download": {
                if (!/http(s)?:\/\/otakudesu.cloud/i.test(text)) return m.reply("Format yang dimasukan tidak valid!")
                const result = await axios.get(global.API("https://api.siputzx.my.id", "/api/anime/otakudesu/download", { url: text }))
                const data = result.data.data
                const megaLink = data.downloads.filter(v => v.host.trim() == "Mega")
                const list = await Promise.all(megaLink.map(async (v, i) => {
                    return [`${usedPrefix}mega ${await originalUrl(v.link)}`, (i + 1).toString(), `Resolusi ${v.quality}`]
                }))
                await conn.textList(m.chat, data.title, false, list, m)
                break
            }
        }
    } finally {
        await conn.loading(m, conn)
    }
}
handler.help = ["otakudesu"]
handler.tags = ["anime"]
handler.command = /^(otakudesu(-download)?)$/i
export default handler

function capitalize(str) {
    return str.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
}

async function originalUrl(url) {
    return (await axios(url)).request.res.responseUrl
}