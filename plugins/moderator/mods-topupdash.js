import moment from "moment-timezone"

let handler = async (m, { conn, usedPrefix, command, text }) => {
  let result = []
  let user = global.db.data.users
  let dataUser = Object.entries(user)
  for (let [number, value] of dataUser) {
    if (typeof value.historyTrx != "object") continue
    let dataHistory = Object.values(value.historyTrx)

    for (let history of dataHistory) {
      if (/refund/i.test(history.type)) continue
      result.push({
        jid: number,
        ...history,
      })
    }
  }

  result.sort((a, b) => b.time - a.time)
  if (/harian/i.test(text)) {
    result = result.filter((v) => isToday(v.time))
    let caption = getCaption(result, "harian")
    m.reply(caption)
  } else if (/mingguan/i.test(text)) {
    result = result.filter((v) => isThisWeek(v.time))
    let caption = getCaption(result, "mingguan")
    m.reply(caption)
  } else if (/bulanan/i.test(text)) {
    result = result.filter((v) => isThisMonth(v.time))
    let caption = getCaption(result, "bulanan")
    m.reply(caption)
  } else if (/tahunan/i.test(text)) {
    result = result.filter((v) => isThisYear(v.time))
    let caption = getCaption(result, "tahunan")
    m.reply(caption)
  } else {
    let caption = getCaption(result, "semua")
    m.reply(caption)
  }
}
handler.help = ["topupdash"]
handler.tags = ["mods"]
handler.command = /^(topupdash(board)?)$/i
handler.mods = true
export default handler

function getCaption(data, type) {
  let caption = `*HISTORY SEMUA TRANSAKSI ${type.toUpperCase()}*\n\n`

  let profit = 0
  let total = 0
  let totalTransaksi = 0
  for (let i of data) {
    profit += countProfit(i.nominal)
    total += parseFloat(i.nominal)
    totalTransaksi++
  }

  caption += `Total Transaksi: ${totalTransaksi}\n`
  caption += `Total Terjual: Rp.${toRupiah(total)}\n`
  caption += `Total Keuntungan: Rp.${toRupiah(profit)}\n`
  caption += `\n*DAFTAR TRANSAKSI*\n\n`
  caption += data
    .map((v, i) => {
      let time = formattedDate(v.time)
      return `
*${i + 1}.* ${time}
Type : ${capitalize(v.type)}
Nominal : Rp.${toRupiah(v.nominal)}
`.trim()
    })
    .join("\n\n")

  return caption
}

function toRupiah(number) {
  return new Intl.NumberFormat("id-ID").format(number)
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.substr(1)
}

function countProfit(jumlahAwal) {
  jumlahAwal = parseInt(jumlahAwal)
  let keuntungan = jumlahAwal * global.config.taxRate
  if (keuntungan > global.config.taxMax) keuntungan = global.config.taxMax
  return keuntungan
}

function isToday(timestampMs) {
  const now = new Date()
  const date = new Date(timestampMs)

  return now.getFullYear() === date.getFullYear() && now.getMonth() === date.getMonth() && now.getDate() === date.getDate()
}

function isThisWeek(timestampMs) {
  const now = new Date()

  const currentDay = now.getDay() === 0 ? 7 : now.getDay()

  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - (currentDay - 1))
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  const date = new Date(timestampMs)
  return date >= startOfWeek && date <= endOfWeek
}

function isThisMonth(timestampMs) {
  const now = new Date()
  const date = new Date(timestampMs)

  return now.getFullYear() === date.getFullYear() && now.getMonth() === date.getMonth()
}

function isThisYear(timestampMs) {
  const now = new Date()
  const date = new Date(timestampMs)

  return now.getFullYear() === date.getFullYear()
}

const formattedDate = (ms) => moment(ms).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm")
