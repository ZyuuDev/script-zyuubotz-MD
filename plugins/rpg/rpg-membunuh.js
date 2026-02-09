import { checkUser } from '../../lib/checkUser.js'

let handler = async (m, { senderKey, conn, text, usedPrefix, command }) => {
    let users = global.db.data.users
    let dapat = (Math.floor(Math.random() * 100000))
    let healtu = (Math.floor(Math.random() * 100))
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
    if (!who) return m.reply('Tag orang yang mau kamu Bunuh!')

    const quotedKey = await checkUser(conn, who)

    if (typeof global.db.data.users[quotedKey] == 'undefined') return m.reply('Pengguna tidak ada didalam data base')
    if (users[quotedKey].level > users[senderKey].level) return m.reply(`Level kamu harus lebih tinggi dari @${quotedKey.split('@')[0]} Untuk bisa Membunuhnya!`, false, { mentions: [quotedKey] })
    let __timers = (new Date - global.db.data.users[senderKey].lastsda)
    let _timers = (3600000 - __timers)
    let timers = clockString(_timers)
    if (new Date - global.db.data.users[senderKey].lastsda > 3600000) {
        if (10 > users[quotedKey].health) return m.reply('target sudah tidak memiliki health💉')
        if (100 > users[quotedKey].money) return m.reply('💠target tidak memiliki apapun :(💠')
        users[quotedKey].health -= healtu * 1
        users[quotedKey].money -= dapat * 1
        users[senderKey].money += dapat * 1
        global.db.data.users[senderKey].lastsda = new Date * 1
        conn.reply(m.chat, `Target berhasil di bunuh dan kamu mengambil money target sebesar\n💰${toRupiah(dapat)} money\ndarah target berkurang -${healtu} health❤`, m)
    } else conn.reply(m.chat, `Anda Sudah Membunuh Dan Berhasil Sembunyi, tunggu ${timers} untuk membunuh lagi`, m)
}
handler.help = ['membunuh']
handler.tags = ['rpg']
handler.command = /^(membunuh)$/i
handler.register = true
handler.group = true
handler.rpg = true

export default handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

function clockString(ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

const toRupiah = number => parseInt(number).toLocaleString().replace(/,/gi, ".")