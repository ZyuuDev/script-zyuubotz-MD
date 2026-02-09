import { googleImage } from '../../lib/scrape.js'
let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) return m.reply(`Masukan nama \n\nContoh: \n${usedPrefix}${command} Sagiri`)
        await conn.loading(m, conn)
        const res = await (await googleImage('rule34 ' + text)).getRandom()
        await conn.sendFile(m.chat, res, 'rule34.jpg', ` \`\`\`➩ Random Nsfw Rule34 ${text ? text.capitalize(): false}\`\`\` `, m)
    } finally {
        await conn.loading(m, conn, true)
    }
}
handler.help = ['rule34']
handler.tags = ['nsfw']
handler.command = ['rule34']
handler.premium = true
handler.nsfw = true
handler.age = 18
export default handler