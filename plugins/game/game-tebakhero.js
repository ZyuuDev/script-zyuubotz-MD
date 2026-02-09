import fs from 'fs'
let timeout = 120000
let poin = 4999
let handler = async (m, { conn, command, usedPrefix }) => {
    conn.tebakhero = conn.tebakhero ? conn.tebakhero: {}
    let id = m.chat
    let ephemeral = conn.chats[m.chat]?.metadata?.ephemeralDuration || conn.chats[m.chat]?.ephemeralDuration || false
    let setting = global.db.data.settings[conn.user.jid]
    if (id in conn.tebakhero) return conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebakhero[id][0])
    let src = JSON.parse(fs.readFileSync('./json/tebakhero.json', 'utf-8'))
    let json = src[Math.floor(Math.random() * src.length)]
    let caption = `
Silahkan Tebak Nama Hero Diatas!

Timeout *${(timeout / 1000).toFixed(2)} detik*
Ketik ${usedPrefix}hro untuk bantuan
Bonus: ${poin} XP
`.trim()
    conn.tebakhero[id] = [
        await conn.sendMessage(m.chat, { image: { url: json.img }, fileName: 'tebakhero.jpg', mimetype: 'image/jpeg', caption: setting.smlcap ? conn.smlcap(caption) : caption }, { quoted: m, ephemeralExpiration: ephemeral }),
        json, poin, 4,
        setTimeout(() => {
            if (conn.tebakhero[id]) conn.reply(m.chat, `Waktu habis!\nJawabannya adalah *${json.jawaban}*`, conn.tebakhero[id][0])
            delete conn.tebakhero[id]
        }, timeout)
    ]
}
handler.help = ['tebakhero']
handler.tags = ['game']
handler.command = /^tebakhero$/i

handler.onlyprem = true
handler.game = true

export default handler