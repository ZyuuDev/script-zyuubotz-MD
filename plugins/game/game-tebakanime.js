import fs from 'fs'
let timeout = 120000
let poin = 4999
let handler = async (m, { conn, command, usedPrefix }) => {
    conn.tebakanime = conn.tebakanime ? conn.tebakanime: {}
    let id = m.chat
    let ephemeral = conn.chats[m.chat]?.metadata?.ephemeralDuration || conn.chats[m.chat]?.ephemeralDuration || false
    let setting = global.db.data.settings[conn.user.jid]
    if (id in conn.tebakanime) return conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebakanime[id][0])
    let src = JSON.parse(fs.readFileSync('./json/tebakanime.json', 'utf-8'))
    let json = src[Math.floor(Math.random() * src.length)]
    let caption = `
Apa nama anime ini?

Timeout *${(timeout / 1000).toFixed(2)} detik*
Ketik ${usedPrefix}hnime untuk bantuan
Bonus: ${poin} XP
`.trim()
    conn.tebakanime[id] = [
        await conn.sendMessage(m.chat, { image: { url: json.img }, fileName: 'tebakanime.jpg', mimetype: 'image/jpeg', caption: setting.smlcap ? conn.smlcap(caption) : caption }, { quoted: m, ephemeralExpiration: ephemeral }),
        json, poin, 4,
        setTimeout(() => {
            if (conn.tebakanime[id]) conn.reply(m.chat, `Waktu habis!\nJawabannya adalah *${json.jawaban}*`, conn.tebakanime[id][0])
            delete conn.tebakanime[id]
        }, timeout)
    ]
}
handler.help = ['tebakanime']
handler.tags = ['game']
handler.command = /^tebakanime$/i

handler.onlyprem = true
handler.game = true

export default handler