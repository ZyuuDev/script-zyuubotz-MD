let handler = async (m, { jid, conn }) => {
    let chats = Object.entries(global.db.data.chats).filter(chat => chat[1].isBanned)
    let users = Object.entries(global.db.data.users).filter(user => user[1].banned)
    let usersGroup = m.isGroup ? Object.entries(global.db.data.chats[m.chat].member || {}).filter(user => user[1].banned) : []

    chats.sort((a, b) => b[1].isBannedTime - a[1].isBannedTime)
    users.sort((a, b) => b[1].bannedTime - a[1].bannedTime)
    usersGroup.sort((a, b) => b[1].bannedTime - a[1].bannedTime)

    let now = Date.now()

    let bannedChats = chats.map(([jid], i) => {
        let name = conn.getName(jid) || 'Unknown'
        let bannedTime = global.db.data.chats[jid].isBannedTime
        let timeRemaining = bannedTime - now
        let banDuration = timeRemaining < 0 ? 'Banned Permanently' : msToDate(timeRemaining)

        return `
│ ${i + 1}. ${name}
│ ${jid}
│ ${banDuration}
`.trim()
    }).join('\n│\n')

    let bannedUsers = users.map(([jid], i) => {
        let name = conn.getName(jid) || 'Unknown'
        let bannedTime = global.db.data.users[jid].bannedTime
        let timeRemaining = bannedTime - now
        let banDuration = timeRemaining < 0 ? 'Banned Permanently' : msToDate(timeRemaining)

        return `
│ ${i + 1}. ${name}
│ ${jid}
│ ${banDuration}
`.trim()
    }).join('\n│\n')
    
    let bannedUsersGroup = usersGroup.map(([jid], i) => {
        let name = conn.getName(jid) || 'Unknown'
        let bannedTime = global.db.data.chats[m.chat].member[jid].bannedTime
        let timeRemaining = bannedTime - now
        let banDuration = timeRemaining < 0 ? 'Banned Permanently' : msToDate(timeRemaining)

        return `
│ ${i + 1}. ${name}
│ ${jid}
│ ${banDuration}
`.trim()
    }).join('\n│\n')

    m.reply(`
┌ *Daftar Chat Terbanned*
│ Total: ${chats.length} Chat
${bannedChats}
└────

┌ *Daftar User Terbanned*
│ Total: ${users.length} User
${bannedUsers}
└────

${m.isGroup ? `
┌ *Daftar User Terbanned Di Group Ini*
│ Total: ${usersGroup.length} User
${bannedUsersGroup}
└────`.trim() : ""}
`.trim())
}

handler.help = ['bannedlist']
handler.tags = ['info']
handler.command = /^(listban(ned)?|ban(ned)?list|daftarban(ned)?)$/i
export default handler

function msToDate(ms) {
    let days = Math.floor(ms / (24 * 60 * 60 * 1000))
    let daysms = ms % (24 * 60 * 60 * 1000)
    let hours = Math.floor((daysms) / (60 * 60 * 1000))
    let hoursms = ms % (60 * 60 * 1000)
    let minutes = Math.floor((hoursms) / (60 * 1000))
    let minutesms = ms % (60 * 1000)
    let sec = Math.floor((minutesms) / 1000)

    return `${days} Days ${hours} Hours ${minutes} Minutes ${sec} Seconds`
}
