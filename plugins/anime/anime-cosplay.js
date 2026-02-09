import { pinterest } from '../../lib/scrape.js'

let handler = async (m, { conn, command, usedPrefix, text }) => {
    try {
        await conn.loading(m, conn)
        if (/http(s)?:\/\/i.pinimg.com/i.test(text)) {
            await conn.sendFile(m.chat, text, '', '', m)
        } else {
            let data = await pinterest(text ? "cosplay" + " " + text : promt.getRandom())
            let list = data.map((v, i) => {
                return [`${usedPrefix + command} ${v.imageURL}`, (i + 1).toString(), `${v.title} By ${v.pinner.fullName}\n${v.description}`.trim()]
            })
            await conn.textList(m.chat, `Terdapat *${data.length} Foto Cosplay*`, data[0].imageURL, list, m)
        }
    } finally {
        await conn.loading(m, conn, true)
    }
}
handler.help = ['cosplay']
handler.tags = ['anime']
handler.command = /^(cosplay)$/i

export default handler

const promt = ["cosplay anime", "cosplaystyle anime", "cosplayer", "anime cos", "cosplayer anime", "cosplay cantik"]