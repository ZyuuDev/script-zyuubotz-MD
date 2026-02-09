let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        if (!args[0]) return m.reply(`Masukan username instagram! \n\nContoh : \n${usedPrefix + command} @ryhar.store`)
        await conn.loading(m, conn)
        args = args[0].startsWith('@') ? args[0].replace('@', '') : args[0]
        let res = await global.fetch(API('lol', '/api/stalkig/' + args, null, 'apikey'))
        let { result } = await res.json()
        let caption = `
❃ Username : ${result.username}
❃ Full Name : ${result.fullname}
❃ Post : ${result.posts}
❃ Follower : ${result.followers}
❃ Following : ${result.following}

❃ Bio : ${result.bio}
`.trim()
        await conn.sendFile(m.chat, result.photo_profile, '', caption, m)
    } finally {
        await conn.loading(m, conn, true)
    }
}
handler.help = ['stalkig']
handler.tags = ['tools']
handler.command = /^((ig|instagram)stalk|stalk(ig|instagram))$/i
handler.limit = true
export default handler