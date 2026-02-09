import uploadFile from '../../lib/uploadFile.js'
import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        let ephemeral = conn.chats[m.chat]?.metadata?.ephemeralDuration || conn.chats[m.chat]?.ephemeralDuration || false
        let setting = global.db.data.settings[conn.user.jid]
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''
        if (!mime) return m.reply(`Kirim/Balas Foto Dengan Caption ${usedPrefix + command}`)
        if (!/image\/(jpe?g|png)/.test(mime)) return m.reply(`*Format ${mime} tidak didukung!*`)
        await conn.loading(m, conn)
        let img = await q.download()
        let files = await uploadFile(img)
        let { data } = await axios.get(global.API('botcahx', '/api/maker/jadianime', { url: files }, 'apikey'))
        await conn.sendMessage(m.chat, { image: { url: data.result.img_1 }, fileName: 'toanime.jpg', mimetype: 'image/jpeg', caption: setting.smlcap ? conn.smlcap("Ini Dia Kak") : "Ini Dia Kak" }, { quoted: m, ephemeralExpiration: ephemeral })
    } finally {
        await conn.loading(m, conn, true)
    }
}
handler.help = ['toanime']
handler.tags = ['tools']
handler.command = /^(jadi|to)anime$/i
handler.limit = true
handler.onlyprem = true
export default handler