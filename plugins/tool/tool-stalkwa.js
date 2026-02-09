import fs from 'fs'
import moment from 'moment-timezone'
import { checkUser } from '../../lib/checkUser.js'

const handler = async (m, { conn, usedPrefix, command, text }) => {
    const target = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false
    if (!target) return m.reply(`Masukan nomor yang ingin kamu stalk! \n\nContoh: \n${usedPrefix + command} 628xxxx`)
    
    const quotedKey = await checkUser(conn, target)
    
    const data = (await conn.onWhatsApp(quotedKey) || {})[0] || {}
    if (!data.exists) return m.reply('Nomor tersebut tidak valid!')
    const bio = await conn.fetchStatus(quotedKey)
    const pp = await conn.profilePictureUrl(quotedKey, 'image').catch(_ => fs.readFileSync('./src/avatar_contact.png'))
    const caption = `
Username: ${await conn.getName(quotedKey)}
Bio: ${bio[0].status ? bio[0].status.status : "Tidak Ada Bio!"}${bio[0].status.setAt ? `
CreatedAt: ${moment(bio[0].status.setAt).tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss')}` : ""}
ID: ${bio[0].id}
`.trim()
    await conn.sendFile(m.chat, pp, 'profile.jpg', caption, m)
}

handler.help = ['stalkwa']
handler.tags = ['tool']
handler.command = /^(stalk(wa|whatsapp))$/i
export default handler
