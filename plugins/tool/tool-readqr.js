import uploadFile from '../../lib/uploadFile.js'

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        let q = m.quoted ? m.quoted: m
        let mime = (q.msg || q).mimetype || ''
        if (!mime) return m.reply('Fotonya Mana? Reply gambarnya aja')
        if (!/image\/(jpe?g|png)/.test(mime)) return m.reply(`Tipe ${mime} tidak didukung!`)
        await conn.loading(m, conn)
        let img = await q.download?.()
        let url = await uploadFile(img)
        let res = await global.fetch(API('lol', '/api/read-qr', { img: url }, 'apikey'))
        let json = await res.json()
        m.reply(json.result, false, false, { smlcap: false })
    } finally {
        await conn.loading(m, conn)
    }
}
handler.help = ['readqr']
handler.tags = ['tools']
handler.command = /^(readqr)$/i
handler.limit = true
export default handler