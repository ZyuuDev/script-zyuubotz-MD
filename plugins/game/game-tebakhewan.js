import fs from 'fs'
let timeout = 120000
let poin = 4999
let handler = async (m, { conn, command, usedPrefix }) => {
    conn.tebakhewan = conn.tebakhewan ? conn.tebakhewan: {}
    let id = m.chat
    let ephemeral = conn.chats[m.chat]?.metadata?.ephemeralDuration || conn.chats[m.chat]?.ephemeralDuration || false
    let setting = global.db.data.settings[conn.user.jid]
    if (id in conn.tebakhewan) return conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebakhewan[id][0])
    let src = JSON.parse(fs.readFileSync('./json/tebakhewan.json', 'utf-8'))
    let json = src[Math.floor(Math.random() * src.length)]
    let caption = `
Silahkan Tebak Nama Hewan Diatas!

Timeout *${(timeout / 1000).toFixed(2)} detik*
Ketik ${usedPrefix}hwan untuk bantuan
Bonus: ${poin} XP
`.trim()
    conn.tebakhewan[id] = [
        await conn.sendMessage(m.chat, { image: { url: json.img }, fileName: 'tebakhewan.jpg', mimetype: 'image/jpeg', caption: setting.smlcap ? conn.smlcap(caption) : caption }, { quoted: m, ephemeralExpiration: ephemeral }),
        json, poin, 4,
        setTimeout(() => {
            if (conn.tebakhewan[id]) conn.reply(m.chat, `Waktu habis!\nJawabannya adalah *${json.nama}*`, conn.tebakhewan[id][0])
            delete conn.tebakhewan[id]
        }, timeout)
    ]
}
handler.help = ['tebakhewan']
handler.tags = ['game']
handler.command = /^tebakhewan$/i

handler.onlyprem = true
handler.game = true

export default handler