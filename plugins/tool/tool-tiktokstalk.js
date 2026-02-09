let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        if (!args[0]) return m.reply(`Masukan username tiktok \n\nContoh: \n${usedPrefix + command} @ryhar_123`)
        await conn.loading(m, conn)
        args = args[0].startsWith('@') ? args[0].replace('@', '') : args[0]
        let res = await global.fetch(API('https://api.ryzendesu.vip', '/api/stalk/tiktok', { username: args }))
        let { userInfo } = await res.json()
        let caption = `
Username: ${userInfo.username}
Name: ${userInfo.name}

Followers: ${toRupiah(userInfo.totalFollowers)}
Following: ${toRupiah(userInfo.totalFollowing)}

Likes: ${toRupiah(userInfo.totalLikes)}
Videos: ${toRupiah(userInfo.totalVideos)}
Friends: ${toRupiah(userInfo.totalFriends)}
${userInfo.bio ? `
Bio: ${userInfo.bio}` : ''}
`.trim()
        await conn.sendFile(m.chat, userInfo.avatar, '', caption, m)
    } finally {
        await conn.loading(m, conn, true)
    }
}
handler.help = ['tiktokstalk']
handler.tags = ['tools']
handler.command = /^((tt|tiktok)stalk|stalk(tt|tiktok))$/i
handler.limit = true
export default handler

function toRupiah(number) {
    return new Intl.NumberFormat('id-ID').format(number)
}