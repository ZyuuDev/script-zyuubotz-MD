import uploadFile from '../../lib/uploadFile.js'
import { removeBackgroundFromImageUrl } from 'remove.bg'

let handler = async (m, { conn, usedPrefix, command, text }) => {
    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''
        if (!mime) return m.reply('Fotonya Mana?')
        if (!/image\/(jpe?g|png)/.test(mime)) return m.reply(`Tipe ${mime} tidak didukung!`)
        let ephemeral = conn.chats[m.chat]?.metadata?.ephemeralDuration || conn.chats[m.chat]?.ephemeralDuration || false
        await conn.loading(m, conn)
        let img = await q.download()
        let files = await uploadFile(img)
        switch (command) {
            case 'removebg': {
                try {
                    let out = API('lol', '/api/removebg', { img: files }, 'apikey')
                    await conn.sendMessage(m.chat, { image: { url: out }, fileName: 'removebg.jpg', mimetype: 'image/jpeg', caption: '*DONE (≧ω≦)ゞ*' }, { quoted: m, ephemeralExpiration: ephemeral })
                } catch {
                    let out = await removebg(files, apiKey.getRandom())
                    await conn.sendFile(m.chat, out, 'out.png', '*DONE (≧ω≦)ゞ*', m)
                }
            break
            }
            case 'changebg': {
                let out = await removebg(files, apiKey.getRandom(), m.quoted ? m.quoted.text : text)
                await conn.sendFile(m.chat, out, 'out.png', '*DONE (≧ω≦)ゞ*', m)
            break
            }
            default:
        }
    } catch (e) {
        throw e
    } finally {
        await conn.loading(m, conn, true)
    }
}
handler.help = ['removebg', 'changebg']
handler.tags = ['tools', 'premium']
handler.command = /^(removebg|changebg)$/i
handler.premium = true
export default handler

const apiKey = ['t4DJWibUPdxTbCiZs6wXUTMB', 'Divb33Vh3YANNFJMPkv4QJs3', '61N7EMLJURGuTdYpavHwkWTC']

async function removebg(url, apikey, color = false) {
    try {
        const result = await removeBackgroundFromImageUrl({
            url,
            apiKey: apikey,
            size: "regular",
            type: "auto",
            bg_color: color ? color: ''
        })
        return Buffer.from(result.base64img, "base64")
    } catch (e) {
        return {
            status: false,
            error: e
        }
    }
}