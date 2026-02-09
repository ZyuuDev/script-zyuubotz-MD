let handler = async (m, { conn }) => {
    let now = Date.now()
    let groups = Object.entries(conn.chats).filter(([jid, chat]) => 
        jid.endsWith('@g.us') && chat?.isChats && !chat?.metadata?.read_only && !chat?.metadata?.announce && 
        !chat?.isCommunity && !chat?.isCommunityAnnounce && !chat?.metadata?.isCommunity && !chat?.metadata?.isCommunityAnnounce
    )
    
    let txt = await Promise.all(groups.map(async ([jid]) => {
        let user = global.db.data.chats[jid]?.member || {}
        let members = Object.entries(user)
            .filter(([, data]) => data?.jid !== conn.user.jid)
            .sort(([, a], [, b]) => (b.chat || 0) - (a.chat || 0))

        let chatToday = members.reduce((sum, [, { chat }]) => sum + (chat || 0), 0)
        let chatTotal = members.reduce((sum, [, { chatTotal }]) => sum + (chatTotal || 0), 0)
        
        let groupName = await conn.getName(jid)
        let groupStatus = conn.chats[jid]?.metadata?.read_only ? 'Left' : 'Joined'
        let expiration = global.db.data.chats[jid]?.expired
        let expiredText = (typeof expiration === 'number' && expiration > now)
            ? msToDate(expiration - now)
            : '*Tidak Diatur Expired Group*'
        
        return `${groupName}\n${jid} [${groupStatus}]\n${expiredText}\nTotal chat group hari ini: ${toRupiah(chatToday)} \nTotal semua chat: ${toRupiah(chatTotal)} \n\n`
    }))

    m.reply(`List Groups:\nTotal Group: ${groups.length}\n\n${txt.join('')}`.trim())
}

handler.help = ['grouplist']
handler.tags = ['group']
handler.command = /^(group(s|list)|(s|list)group)$/i
handler.owner = true
export default handler

function msToDate(ms) {
    let days = Math.floor(ms / (24 * 60 * 60 * 1000))
    let hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    let minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
    return `${days} Days \n${hours} Hours \n${minutes} Minute`
}

function toRupiah(number) {
    return new Intl.NumberFormat('id-ID').format(number)
}