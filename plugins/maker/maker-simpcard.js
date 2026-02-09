import { checkUser } from "../../lib/checkUser.js"

let handler = async (m, { senderKey, conn }) => {
    try {
        await conn.loading(m, conn)
        let who = m.quoted ? m.quoted.sender: m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0]: m.fromMe ? conn.user.jid: senderKey
        
        const quotedKey = await checkUser(m, who)
        
        await conn.sendFile(m.chat, global.API('https://some-random-api.com', '/canvas/simpcard', {
            avatar: await conn.profilePictureUrl(quotedKey).catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png'),
        }), 'simpcard.png', 'simp', m)
    } catch (e) {
        throw e
    } finally {
        await conn.loading(m, conn, true)
    }
}

handler.help = ['simpcard']
handler.tags = ['maker']
handler.limit = true

handler.command = /^(simpcard)$/i

export default handler