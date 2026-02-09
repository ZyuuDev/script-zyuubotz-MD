import { checkUser } from '../../lib/checkUser.js'

let handler = async (m, { senderKey, conn, args, usedPrefix, command }) => {
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.fromMe ? conn.user.jid : senderKey
    
    const quotedKey = await checkUser(conn, who)
    
    let user = global.db.data.users[quotedKey]
    let userGroup = global.db.data.chats[m.chat].member[quotedKey]
    let userName = senderKey == quotedKey ? "Kamu" : "Dia"
    if (user.banned) {
        let { diffDays, diffHours, diffMinutes, day, month, year, hours, minutes } = await formatTimestamp(user.bannedTime)
        m.reply(`${userName} Telah *Dibanned Owner* Selama ${diffDays ? `${diffDays} Hari` : ""} ${diffHours} Jam, ${diffMinutes} Menit`)
    } else if (userGroup.banned) {
        let { diffDays, diffHours, diffMinutes, day, month, year, hours, minutes } = await formatTimestamp(user.bannedTime)
        m.reply(`${userName} Telah *Dibanned Admin* Selama ${diffDays ? `${diffDays} Hari` : ""} ${diffHours} Jam, ${diffMinutes} Menit`)
    } else m.reply(`${userName} Tidak Di-Banned!`)
}
handler.help = ['cekbanned']
handler.tags = ['info']
handler.command = /^(cek(banned|ban))$/i
export default handler

function formatTimestamp(ms) {
    let now = new Date()
    let futureDate = new Date(ms)
    
    // Hitung selisih waktu dalam milidetik
    let diffMs = futureDate - now
    
    // Konversi ke hari, jam, dan menit
    let diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    let diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    let diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return {
        diffDays,
        diffHours,
        diffMinutes
    }
}