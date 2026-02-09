import fs from 'fs'
let handler = async (m, { conn }) => {
    try {
        await conn.loading(m, conn)
        let teks = ` mau sewa kak? hubungi nomor dubawah atau ketik .owner untuk melihat harga bot ini
${global.config.owner.map(([jid, name]) => {
    return `
Name : ${name}
https://wa.me/${jid}
`.trim()
}).join('\n\n')
}
`.trim()
        await conn.adReply(m.chat, teks, 'S E W A - B O T', '', fs.readFileSync('./media/thumbnail.jpg'), global.config.website, m)
    } finally {
        await conn.loading(m, conn, true)
    }
}
handler.help = ['sewabot']
handler.tags = ['main']
handler.command = /^sewa(bot)?$/i

export default handler