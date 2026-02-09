import moment from "moment-timezone"
import chartImage from "../../lib/chart.js"
import fs from "fs"

let handler = async (m, { senderKey, conn, usedPrefix, command, args }) => {
  let bot = global.db.data.bots
  let user = global.db.data.users[senderKey]
  let name = user.registered ? user.name : conn.getName(senderKey)
  let emot = (v) => global.rpg.emoticon(v)

  let invest = Object.entries(bot.invest.item)
    .filter(([key, val]) => !val.suspend)
    .sort((a, b) => {
      let totalA = a[1].marketcap * a[1].harga
      let totalB = b[1].marketcap * b[1].harga
      return totalB - totalA
    })

  let cap = `
*Market Bot ${conn.user.name}*

${invest
  .map((v, i) => {
    let hargaSebelumnya = v[1].hargaBefore
    let hargaSekarang = v[1].harga
    let keuntungan = ((hargaSekarang - hargaSebelumnya) / hargaSebelumnya) * 100
    let update = hargaSekarang - hargaSebelumnya

    return `
*${i + 1}.* ${v[1].symbol} ${v[1].name}
Harga: ${toRupiah(hargaSekarang)}
Update: ${update > 0 ? `+${toRupiah(update)}` : toRupiah(update)} (${keuntungan.toFixed(2)}%)
Market Cap: ${toRupiah(v[1].marketcap * hargaSekarang)}
`.trim()
  })
  .join("\n\n")}

Contoh Penggunaan:
> Untuk Membeli Crypto
> ${usedPrefix}crypto-buy bitcoin 100
> Untuk Menjual Crypto
> ${usedPrefix}crypto-sell bitcoin 100
`.trim()

  let commands = (command.split("-")[1] || "").toLowerCase()
  let coinName = (args[0] || "").toLowerCase()

  if (!coinName || !commands) {
    return conn.adReply(m.chat, cap, `Halo ${name}, ${wish()}`, global.config.watermark, fs.readFileSync("./media/chart.jpg"), global.config.website, m)
  }

  let coinEntry = Object.entries(bot.invest.item).find(([key, val]) => (val.name.toLowerCase() === coinName || key === coinName) && !val.suspend)

  if (!coinEntry) {
    return m.reply(`Nama koin tidak ditemukan!\n*List koin:* \n\n${invest.map((v) => `*•* ${v[1].name}`).join("\n")}`)
  }

  let [coinKey, coinData] = coinEntry
  let { harga } = coinData

  if (!user.invest[coinKey]) {
    user.invest[coinKey] = { harga: 0, stock: 0 }
  }

  let total = parseInt(args[1])
  if (isNaN(total) || total < 1) total = 1

  switch (commands) {
    case "buy": {
      let price = harga * total
      if (price > user.bank) return m.reply("Saldo bank kamu kurang untuk membeli koin ini")

      let average = await calculateAverage(user.invest[coinKey].harga, user.invest[coinKey].stock, harga, total)
      user.bank -= price
      user.invest[coinKey].stock += total
      user.invest[coinKey].harga = average

      coinData.marketcap += total
      coinData.volumeBuy += total
      coinData.trade.push({ user: senderKey, total, type: "buy" })

      m.reply(`Berhasil membeli ${total} ${capitalize(coinKey)} ${coinData.symbol} seharga ${toRupiah(price)} Bank ${emot("bank")}`)
      break
    }
    case "sell": {
      if (user.invest[coinKey].stock < total) {
        return m.reply(`Kamu hanya memiliki ${user.invest[coinKey].stock} ${capitalize(coinKey)} ${coinData.symbol}`)
      }

      let price = harga * total
      if (user.fullatm < user.bank + price) {
        return m.reply("Kapasitas Bank kamu telah penuh, silakan upgrade terlebih dahulu!")
      }

      user.bank += price
      user.invest[coinKey].stock -= total
      // Tidak perlu update average saat jual

      coinData.marketcap -= total
      coinData.volumeSell += total
      coinData.trade.push({ user: senderKey, total, type: "sell" })

      m.reply(`Berhasil menjual ${total} ${capitalize(coinKey)} ${coinData.symbol} seharga ${toRupiah(price)} Bank ${emot("bank")}`)
      break
    }
    case "history": {
      let tradeData = [...coinData.trade].reverse().slice(0, 19)
      let footer = `${coinData.name} Trade History\n\n`
      let cap = tradeData
        .map((v) => {
          let username = conn.getName(v.user).slice(0, 5)
          let action = v.type === "buy" ? "_Membeli_" : "_Menjual_"
          return `> (${username}..) ${action} *${v.total}* ${coinData.symbol} ${coinData.name}`
        })
        .join("\n")
      m.reply(footer + cap)
      break
    }
    case "chart":
    case "candle": {
      const rangeOptions = ["today", "3d", "7d", "30d", "all"]

      if (!args[1]) {
        return m.reply(`Silakan pilih rentang waktu untuk grafik:\n${rangeOptions.map((v) => `*•* ${v}`).join("\n")}\n\nContoh: ${usedPrefix + command} ${coinKey} 7d`)
      }

      const range = rangeOptions.includes(args[1].toLowerCase()) ? args[1].toLowerCase() : "all"
      const filteredData = filterTimestampData(coinData.chart, range)
      const cleanedData = filterSameValues(filteredData)

      if (Object.keys(cleanedData).length === 0) return m.reply(`Tidak ada data untuk rentang waktu "${range}".`)

      const chartPoints = Object.values(cleanedData)

      const caption = `
Harga ${capitalize(range)} :
Open   : ${toRupiah(coinData.open)}
Highest: ${toRupiah(coinData.high)}
Lowest : ${toRupiah(coinData.low)}
Close  : ${toRupiah(coinData.harga)}
`.trim()

      const chart = await chartImage(chartPoints)
      await conn.sendFile(m.chat, chart, null, caption, m)
      break
    }
    default:
      return m.reply("Perintah tidak dikenali!")
  }
}

handler.help = ["crypto"]
handler.tags = ["rpg"]
handler.command = /^((invest(asi)?|crypto)(-buy|-sell|-history|-chart|-candle)?)$/i
handler.rpg = true
handler.group = true
export default handler

async function calculateAverage(hargaOld, stockOld, hargaBaru, stockBaru) {
  let totalBiaya = hargaOld * stockOld + hargaBaru * stockBaru
  let totalStock = stockOld + stockBaru
  return totalStock === 0 ? 0 : totalBiaya / totalStock
}

function isNumber(value) {
  return !isNaN(parseInt(value))
}

function toRupiah(number) {
  return parseInt(number).toLocaleString("id-ID")
}

function wish() {
  let time = moment.tz("Asia/Jakarta").format("HH")
  if (time >= 0 && time < 4) return "Selamat Malam"
  if (time >= 4 && time < 11) return "Selamat Pagi"
  if (time >= 11 && time < 15) return "Selamat Siang"
  if (time >= 15 && time < 18) return "Selamat Sore"
  return "Selamat Malam"
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function filterTimestampData(data, range = "all") {
  const now = Date.now()
  let startTime = 0

  switch (range) {
    case "today": {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)
      startTime = startOfDay.getTime()
      break
    }
    case "3d":
      startTime = now - 3 * 24 * 60 * 60 * 1000
      break
    case "7d":
      startTime = now - 7 * 24 * 60 * 60 * 1000
      break
    case "30d":
      startTime = now - 30 * 24 * 60 * 60 * 1000
      break
    case "all":
    default:
      startTime = 0
      break
  }

  const result = {}
  for (const [key, value] of Object.entries(data)) {
    const t = Number(key)
    if (range === "all" || (t >= startTime && t <= now)) {
      result[key] = value
    }
  }

  return result
}

function filterSameValues(data) {
  const result = {}

  for (const [key, arr] of Object.entries(data)) {
    if (Array.isArray(arr) && !arr.every((v) => v === arr[0])) {
      result[key] = arr
    }
  }

  return result
}
