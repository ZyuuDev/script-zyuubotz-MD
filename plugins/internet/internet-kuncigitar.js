import { chord } from "../../lib/scrape.js"
let handler = async (m, { conn, text, usedPrefix, command }) => {
	if (!text) return m.reply(`Masukan nama lagu!!\n\nContoh\n${usedPrefix + command} mantra hujan`)
	let result = await chord(text)
	let teks = `
*Title :* ${result.title}
*Artist :* ${result.artist}

*Chord :*
${result.chord}
`.trim()
    m.reply(teks, false, false, { smlcap: true, except: [result.chord] })
}
handler.help = ['kuncigitar']
handler.tags = ['internet']
handler.command = /^(kuncigitar|chord)$/i
export default handler