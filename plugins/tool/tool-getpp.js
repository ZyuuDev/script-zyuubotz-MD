import fs from "fs"
import { checkUser } from "../../lib/checkUser.js"

let handler = async(m, { conn, senderKey }) => {
    try {
        await conn.loading(m, conn)
        let who
        if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : senderKey
        else who = senderKey

        const quotedKey = await checkUser(conn, who)

        let pp = await conn.profilePictureUrl(quotedKey, 'image').catch(_ => fs.readFileSync('./src/avatar_contact.png'))
        await conn.sendFile(m.chat, pp, 'profile.jpg', `@${quotedKey.split`@`[0]}`, m, null, { mentions: [quotedKey] })
    } catch (e) {
        m.reply("Tidak dapat mengambil PP")
    } finally {
        await conn.loading(m, conn, true)
    }
}
handler.help = ['getprofile']
handler.tags = ['tools']
handler.command = /^(get(pp|profile))$/i

handler.group = true
handler.limit = true
export default handler