import { checkUser } from '../../lib/checkUser.js'

let handler = async (m, { senderKey, conn, usedPrefix, command, text }) => {
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false
    if (!who) return m.reply(`Reply atau tag orangnya \n\nContoh: \n${usedPrefix + command} @${senderKey.split('@')[0]}`, false, { mentions: [senderKey] })
    
    const quotedKey = await checkUser(conn, who)
    
    let user = global.db.data.users
    if (typeof user[quotedKey] == 'undefined') return m.reply('Orang tersebut tidak ada didatabase')
    if (user[quotedKey].bank < 1000000) return m.reply('Saldo bank orang tersebut tidak mencukupi')
    if (new Date - user[quotedKey].lockBankCD < 36000000) return m.reply(`Bank orang tersebut terkunci selama ${getTime(36000000, user[quotedKey].lockBankCD)}`)
    if (new Date - user[senderKey].lasthackbank < 10800000) return conn.reply(m.chat, `Anda sudah menjebol bank hari ini, sistem membutuhkan cooldown ${getTime(10800000, user[senderKey].lasthackbank)}`, m)
    if (user[senderKey].level < user[quotedKey].level) return m.reply('Level kamu kurang untuk hack bank dia')
    let dapat = (Math.floor(Math.random() * 1000000))
    let caption = [
        'Please enter the password and user',
        'Login *****',
        'Password ******',
        `Berhasil masuk ke sistem ${conn.getName(quotedKey)}`,
        `Mengambil *${toRupiah(dapat)} Money* ${global.rpg.emoticon("money")}`,
        'Logout ******',
        `Berhasil mendapatkan *${toRupiah(dapat)} Money* ${global.rpg.emoticon("money")} dari bank user`
    ]
    user[quotedKey].bank -= dapat
    user[senderKey].money += dapat
    user[senderKey].lasthackbank = new Date() * 1
    let { key } = await m.reply('Sedang mencoba menjebol sistem...')
    for (let cap of caption) {
        await conn.sendMessage(m.chat, { text: cap, edit: key })
        await delay(2000)
    }
}
handler.help = ['hackbank']
handler.tags = ['rpg']
handler.command = ['hackbank']
handler.rpg = true
handler.group = true
export default handler
const isNumber = x => typeof x === 'number' && !isNaN(x)

const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
    clearTimeout(this)
    resolve()
}, ms))

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

function getTime(cooldown, date) {
    let __timers = (new Date - date)
    let _timers = (cooldown - __timers)
    let timers = clockString(_timers)
    return timers
}

function clockString(ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

const toRupiah = number => parseInt(number).toLocaleString().replace(/,/gi, ".")