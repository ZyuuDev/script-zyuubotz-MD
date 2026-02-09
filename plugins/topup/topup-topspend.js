import moment from "moment-timezone"

let handler = async (m, { conn, usedPrefix, command, text }) => {
    let user = global.db.data.users
    let dataUser = Object.entries(user)
    let result = []

    for (let [number, value] of dataUser) {
        if (typeof value.historyTrx != "object") continue
        let dataHistory = Object.values(value.historyTrx)
        let total = 0
        for (let history of dataHistory) {
            if (/refund|deposit/i.test(history.type)) continue
            total += +history.nominal
        }
        result.push({
            jid: number,
            total
        })
    }

    result = result.filter(v => v.total > 0)
    result.sort((a, b) => +b.total - +a.total)
    let caption = `*TOP SPENDER*\n\n`
    for (let i = 0; i < result.length; i++) {
        let v = result[i]
        //let name = user[v.jid].registered ? user[v.jid].name : m.name
        caption += `
${v.jid.slice(0, 6)}..
Total Spend : Rp ${toRupiah(v.total)}
`.trim() + "\n\n"
    }

    m.reply(caption.trim())
}
handler.help = ["topspend"]
handler.tags = ["topup"]
handler.command = /^(topspend(er)?)$/i
export default handler

function formattedDate(ms) {
    return moment(ms).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm')
}

let toRupiah = number => parseInt(number).toLocaleString().replace(/,/g, ".")