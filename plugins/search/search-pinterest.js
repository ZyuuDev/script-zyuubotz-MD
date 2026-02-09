import { pinterest } from '../../lib/scrape.js'

let handler = async (m, { conn, command, usedPrefix, text }) => {
    try {
        let isHentai = isHent.exec(text)
        let ephemeral = conn.chats[m.chat]?.metadata?.ephemeralDuration || conn.chats[m.chat]?.ephemeralDuration || false

        if (!text) {
            return m.reply(`Masukan Query! \n\nContoh : \n${usedPrefix + command} Hu Tao`)
        }
        if (isHentai) {
            return m.reply('Jangan Mencari Hal Aneh!, Ketahuan Owner Bakal Di Banned')
        }
        await conn.loading(m, conn)
        if (/http(s)?:\/\/i.pinimg.com/i.test(text)) {
            await conn.sendFile(m.chat, text, '', '', m)
        } else {
            let result = await pinterest(text)
            if (result.toString().endsWith('mp4')) {
                let { data } = await conn.getFile(result)
                await conn.sendMessage(m.chat, { video: data, fileName: Date.now() + ".mp4", mimetype: "video/mp4" }, { quoted: m, ephemeralExpiration: ephemeral })
            } else {
                let list = result.map((v, i) => {
                    return [`${usedPrefix + command} ${v.imageURL}`, (i + 1).toString(), `${v.title} By ${v.pinner.fullName}\n${v.description}`.trim()]
                })
                await conn.textList(m.chat, `Terdapat *${result.length} Foto*`, result[0].imageURL, list, m)
            }
        }
    } catch (e) {
        console.error(e)
        m.reply(`Tidak dapat menemukan *${text}*`)
    } finally {
        await conn.loading(m, conn, true)
    }
}

handler.help = ['pinterest']
handler.tags = ['search']
handler.command = /^(pin(terest)?)$/i
handler.limit = true
export default handler

let isHent = /vicidior|kimi|babat|ceker|toket|tobrut|sepon(g|k)?|desah|xnxx|khalifah|sexy|bikini|bugil|r34|xx(x)?|sex|porno|tete|payudara|penis|montok|ngocok|oppai|naked|bikini|sex(y|i)|boha(y|i)|tetek|titi(t)?|hent(ai|ao)?|animeh|puss(y|i)|dick|xnxx|kontol|colmek|coli|cum|hot|meme(k|g)|neocoil(l)?|yamete|kimochi|boke(p)?|nsfw|rule34|telanjang|crot|peju/i
