let handler = async (m, { conn, senderKey, text, usedPrefix }) => {
    let user = global.db.data.users[senderKey]
    let bot = global.db.data.bots.users
    let prefix = usedPrefix || '.'

    if (!user) return m.reply("Kamu belum terdaftar!")

    if (/iya/i.test(text)) {
        if (!user.email || !user.verif) {
            return m.reply("Email kamu belum terverifikasi! tidak bisa logout")
        }
        bot[user.email] = { ...user, verif: true }
        delete global.db.data.users[senderKey]
        return m.reply("Berhasil logout!")
    }

    if (/tidak/i.test(text)) {
        return m.reply("Tidak jadi logout!")
    }

    if (!user.email || !user.verif) {
        return m.reply("Email kamu belum terverifikasi! tidak bisa logout")
    }

    await conn.textOptions(m.chat, `Apa kamu yakin ingin logout?`, false, [[`${prefix}logout iya`, "iya"], [`${prefix}logout tidak`, "tidak"]], m)
}
handler.help = ["logout"]
handler.tags = ["xp"]
handler.command = /^(logout)$/i
export default handler
