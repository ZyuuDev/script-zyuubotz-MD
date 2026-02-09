import { Nimegami } from "../../lib/scrape.js"
const nimegami = new Nimegami()

let handler = async (m, { conn, usedPrefix, command, text }) => {
    try {
        const [query, isDownload, resolusi] = text.split('|')
        if (/http(s)?:\/\/nimegami/.test(query) && isDownload && resolusi) {
            const result = await nimegami.download(query)
            const eps = result.eps.find(v => v.nameEps === isDownload)
            const link = eps.resolusi.filter(v => v.resol === resolusi)
            const caption = link.map(v => {
                return v.link
            }).join("\n\n")
            m.reply(caption)
        } else if (/http(s)?:\/\/nimegami/.test(query) && isDownload && !resolusi) {
            const result = await nimegami.download(query)
            const eps = result.eps.find(v => v.nameEps === isDownload)
            const uniqEps = eps.resolusi.filter((v, i, arr) => arr.findIndex(item => item.resol === v.resol) === i)
            const list = uniqEps.map((v, i) => {
                return [`${usedPrefix + command} ${query}|${isDownload}|${v.resol}`, (i + 1).toString(), v.name]
            })
            await conn.textList(m.chat, `Terdapat *${uniqEps.length} Resolusi*`, false, list, m)
        } else if (/http(s)?:\/\/nimegami/.test(query) && !isDownload && !resolusi) {
            const result = await nimegami.detail(query)
            const result2 = await nimegami.download(query)
            const caption = result.data.map(v => {
                return `*${v.key}* : ${v.value}`
            }).join('\n')
            const list = result2.eps.map((v, i) => {
                return [`${usedPrefix + command} ${query}|${v.nameEps}`, (i + 1).toString(), v.nameEps]
            })
            await conn.textList(m.chat, caption, result.thumbnail, list, m)
        } else {
            const result = await nimegami.search(query)
            if (!result.length) return m.reply('Query not found')
            const list = result.map((v, i) => {
                return [`${usedPrefix + command} ${v.link}`, (i + 1).toString(), `*${v.title}* \nStatus : ${v.status}`]
            })
            await conn.textList(m.chat, `Terdapat *${result.length} Anime*`, false, list, m)
        }

    } finally {
    }
}
handler.help = ['nimegami']
handler.tags = ['anime']
handler.command = /^(nimegami)$/i
handler.limit = true
export default handler