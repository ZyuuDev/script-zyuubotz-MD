import moment from 'moment-timezone'
import fs from 'fs'

let handler = async (m, { senderKey, conn, usedPrefix, command, args }) => {
    let bot = global.db.data.bots
    let user = global.db.data.users[senderKey]
    let name = user.registered ? user.name : conn.getName(senderKey)
    let sahamBot = bot.saham.item

    // Filter hanya saham yang tidak disuspend
    let activeItems = Object.entries(sahamBot)
        .filter(([key, val]) => val.suspend === false)
        .map(([key]) => key)

    // Ambil data saham user yang valid dan aktif
    let invest = Object.entries(user.saham || {})
        .filter(([key, val]) => val.stock > 0 && activeItems.includes(key))

    if (invest.length === 0) {
        return conn.reply(m.chat, `Kamu belum memiliki saham aktif saat ini.`, m)
    }

    const hargaSebelumnyas = await Hitung(invest)
    const hargaSekarangs = await HitungProfit(invest, sahamBot)
    const keuntungans = ((hargaSekarangs - hargaSebelumnyas) / hargaSebelumnyas) * 100

    let cap = `
*📈 Market Bot ${conn.user.name}*
*👤 Investor:* ${name}

💰 *Total Investasi :* ${toRupiah(hargaSebelumnyas)}
📊 *Investasi Sekarang :* ${toRupiah(hargaSekarangs)}
📈 *Total Profit :* ${toRupiah(hargaSekarangs - hargaSebelumnyas)} (${keuntungans.toFixed(2)}%)

${invest.map(([key, val], i) => {
    const hargaSekarang = sahamBot[key].harga
    const keuntungan = ((hargaSekarang - val.harga) / val.harga) * 100
    const profit = hargaSekarang - val.harga

    return `*${i + 1}.* ${sahamBot[key].symbol} ${capitalize(key)}
- Avarage: ${toRupiah(val.harga)}
- Harga/lembar: ${toRupiah(hargaSekarang)}
- Harga/lot: ${toRupiah(hargaSekarang * 100)}
- Lembar: ${val.stock}
- Lot: ${val.stock / 100}
- Investasi: ${toRupiah(val.stock * val.harga)}
- Investasi Sekarang: ${toRupiah(val.stock * hargaSekarang)}
- Profit: ${profit > 0 ? `+${toRupiah(profit * val.stock)}` : toRupiah(profit * val.stock)} (${keuntungan.toFixed(2)}%)`
}).join('\n\n')}
`.trim()

    await conn.adReply(m.chat, cap, `Halo ${name}, ${wish()}`, global.config.watermark, fs.readFileSync("./media/chart.jpg"), global.config.website, m)
}
handler.help = ["mysaham"]
handler.tags = ["rpg"]
handler.command = /^(mysaham)$/i
handler.rpg = true
handler.group = true
export default handler

function toRupiah(number) {
    return parseInt(number).toLocaleString('id-ID')
}

async function Hitung(invest) {
    return invest.reduce((acc, [_, val]) => acc + (val.stock * val.harga), 0)
}

async function HitungProfit(invest, sahamBot) {
    return invest.reduce((acc, [key, val]) => acc + (val.stock * sahamBot[key].harga), 0)
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1)
}

function wish() {
    const time = moment.tz('Asia/Jakarta').hour()
    if (time >= 4 && time < 11) return 'Selamat Pagi'
    if (time >= 11 && time < 15) return 'Selamat Siang'
    if (time >= 15 && time < 18) return 'Selamat Sore'
    return 'Selamat Malam'
}
