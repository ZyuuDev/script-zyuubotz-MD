import moment from "moment-timezone"

let handler = async (m, { conn, usedPrefix, command, text }) => {
    let user = global.db.data.users
    let dataUser = Object.entries(user)
    let result = []

    for (let [number, value] of dataUser) {
        if (typeof value.historyTrx != "object") continue
        let dataHistory = Object.values(value.historyTrx)

        for (let history of dataHistory) {
            if (/refund/i.test(history.type)) continue
            result.push({
                jid: number,
                ...history
            })
        }
    }

    result.sort((a, b) => b.time - a.time)

    let caption = `*HISTORY SEMUA TRANSAKSI*\n\n`

    for (let i = 0; i < result.length; i++) {
        let v = result[i]
        caption += `
*${i + 1}.* ${v.jid.slice(0, 6)}..
Type : ${v.type}
Nominal : Rp ${toRupiah(v.nominal)}
Transaksi Time : ${getTime(v.time)}
`.trim() + "\n\n"
    }

    m.reply(caption.trim())
}
handler.help = ["historyall"]
handler.tags = ["topup"]
handler.command = /^(historyall)$/i
export default handler

function formattedDate(ms) {
    return moment(ms).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm')
}

let toRupiah = number => parseInt(number).toLocaleString().replace(/,/g, ".")

export function getTime(ms) {
    let now = parseMs(+new Date() - ms)
    if (now.days) return `${now.days} days ago`
    else if (now.hours) return `${now.hours} hours ago`
    else if (now.minutes) return `${now.minutes} minutes ago`
    else return `a few seconds ago`
}

export function parseMs(ms) {
    if (typeof ms !== 'number') throw 'Parameter must be filled with number'
    return {
        days: Math.trunc(ms / 86400000),
        hours: Math.trunc(ms / 3600000) % 24,
        minutes: Math.trunc(ms / 60000) % 60,
        seconds: Math.trunc(ms / 1000) % 60,
        milliseconds: Math.trunc(ms) % 1000,
        microseconds: Math.trunc(ms * 1000) % 1000,
        nanoseconds: Math.trunc(ms * 1e6) % 1000
    }
}