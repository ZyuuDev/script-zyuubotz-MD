import { sinonim } from "../../lib/scrape.js"
let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) return m.reply(`Masukan Kata! \n\nContoh : \n${usedPrefix + command} keren`)
    let kata = await sinonim(text)
    m.reply(kata.result.join('\n'))
}
handler.help = ['sinonim']
handler.tags = ['internet']
handler.command = /^(sinonim)$/i

export default handler