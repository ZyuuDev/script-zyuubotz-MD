import { checkUser } from "../../lib/checkUser.js"

let handler = async (m, { senderKey, conn, usedprefix }) => {
    try {
        await conn.loading(m, conn)
        let who = m.quoted ? m.quoted.sender: m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0]: m.fromMe ? conn.user.jid: senderKey
        
        const quotedKey = await checkUser(m, who)
        
        let image = API('https://some-random-api.com', '/canvas/lolice', {
            avatar: await conn.profilePictureUrl(quotedKey).catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png'),
        })
        await conn.sendFile(m.chat, image, false, 'Nih Bang Dah jadi', m, false)
    } catch (e) {
        throw e
    } finally {
        await conn.loading(m, conn, true)
    }
}

handler.help = ['lolice']
handler.tags = ['maker']
handler.command = /^(lolice)$/i

export default handler