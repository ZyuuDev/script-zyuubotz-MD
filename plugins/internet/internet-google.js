import axios from 'axios'
import { screenshotWeb } from '../../lib/scrape.js'
let handler = async (m, { conn, usedPrefix, command, text }) => {
    try {
        if (!text) return conn.reply(m.chat, `Masukan Text Yang Ingin Dicari\n\nContoh :\n${usedPrefix + command} Kapan Google Dibuat`, m)
        await conn.loading(m, conn)
        let url = 'https://google.com/search?q=' + encodeURIComponent(text)
        let ss = await screenshotWeb(url, { width: 1024, height: 768 })
        let data = await google(text)
        let mes = `*Hasil Pencarian Google*\n\n`
        for (let i = 0; i < data.length; i++) {
            let { title, link, snippet } = data[i]
            mes += `*${title}*\n_${link}_\n${snippet}\n\n`
        }
        await conn.adReply(m.chat, mes, "Google Search",  "", ss, url, m)
    } finally {
        await conn.loading(m, conn, true)
    }
}
handler.help = ['google']
handler.tags = ['internet']
handler.command = /^google$/i
handler.limit = true
export default handler

async function google(teks) {
  try {
    const response = await axios.get(`https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(teks)}&key=AIzaSyAajE2Y-Kgl8bjPyFvHQ-PgRUSMWgBEsSk&cx=e5c2be9c3f94c4bbb`);
    return response.data.items;
  } catch (e) {
    console.error(e);
    return [];
  }
}