import { checkUser } from '../../lib/checkUser.js'

const items = [ 'money', 'chip' ]
let handler = async (m, { senderKey, conn, args, usedPrefix, command }) => {
    conn.judipvp = conn.judipvp ? conn.judipvp : {}
    if (Object.values(conn.judipvp).find(room => room.id.startsWith('judipvp') && [room.p, room.p2].includes(senderKey))) return m.reply('Selesaikan judi mu yang sebelumnya')
    if (Object.values(conn.judipvp).find(room => room.id.startsWith('judipvp') && [room.p, room.p2].includes(m.mentionedJid[0]))) return m.reply(`Orang yang kamu tantang sedang bermain judipvp bersama orang lain :(`)
    let musuh = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false
    
    const quotedKey = await checkUser(conn, musuh)

    let user = global.db.data.users
    let item = items.filter(v => v in user[senderKey] && typeof user[senderKey][v] == 'number')
    let type = (args[0] || '').toLowerCase()
    let count = (args[1] && number(parseInt(args[1])) ? Math.max(parseInt(args[1]), 1): /all/i.test(args[1]) ? Math.floor(parseInt(user[type])): 1) * 1
    let id = 'judipvp_' + new Date() * 1
    if (user[senderKey][type] < count) return m.reply(`${type} kamu tidak cukup!`)
    if (!item.includes(type)) return m.reply('Item yang tersedia\n• Money\n• Chip')
    if (!count || !quotedKey) return m.reply(`Masukan format dengan benar\n\nContoh :\n${usedPrefix + command} money 10000 ${senderKey.split('@')[0]}`)
    conn.judipvp[id] = {
        chat: await conn.reply(m.chat, `@${senderKey.split('@')[0]} Mengajak @${quotedKey.split('@')[0]} Berjudi Apakah Kamu Mau Menerimanya? (Y/N)`, m, {
            contextInfo: { mentionedJid: [senderKey, quotedKey] } 
        }),
        id: id,
        p: senderKey,
        p2: quotedKey,
        type: type,
        status: 'wait',
        taruhan: count,
        waktu: setTimeout(() => {
            if (conn.judipvp[id]) conn.reply(m.chat, `_Waktu judi habis_`, m)
            delete conn.judipvp[id]
        }, 60000)
    }
}
handler.help = ['judipvp']
handler.tags = ['rpg']
handler.command = /^(judipvp)$/i
handler.register = true
handler.group = true
handler.rpg = true
export default handler

function number(x = 0) {
    x = parseInt(x)
    return !isNaN(x) && typeof x == 'number'
}