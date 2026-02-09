import axios from "axios"
import moment from "moment-timezone"
import fs from "fs"
import path from "path"
import os from "os"
import { otakudesu } from "./scrape.js"
import { cekSaldo, orderProduk } from "./digiflazz.js"
import createAzanImage from "./createAzanImage.js"
import Helper from "./helper.js"
import archiver from "archiver"
import { readdirSync, rmSync } from "fs"

function imageTransaksi(status) {
  let image = {
    Pending: "pembayaran_diproses.png",
    Sukses: "pembayaran_berhasil.png",
    Gagal: "pembayaran_gagal.png",
  }
  return fs.readFileSync(`./media/${image[status]}`)
}

function getCaption(status, refID, produk, harga, sn) {
  let desc = {
    Pending: "",
    Sukses: "_Silahkan Cek Akun Anda, Jika Belum Masuk Hubungi Owner._",
    Gagal: "_Mohon Maaf, Saldo Anda Sudah Di-Convert Menjadi Saldo Deposit, Silahkan Ulangi Transaksi Atau Hubungi Owner._",
  }
  let caption = `
*TRANSAKSI ${status.toUpperCase()}!*

RefID : ${refID} ${
    sn
      ? `
SN : *${sn}*`
      : ""
  }
Pembelian : ${produk}
Harga : Rp ${toRupiah(harga)} ${
    status == "Gagal"
      ? `
Saldo : + Rp ${toRupiah(harga)}`
      : ""
  }
Status : ${status}
Waktu : ${formattedDate(Date.now())}

_Pembelian ${produk} ${status}!_ ${desc[status]}
`.trim()
  return caption
}

function msToTime(ms) {
  let seconds = parseInt((ms / 1000) % 60)
  let minutes = parseInt((ms / (1000 * 60)) % 60)
  let hours = parseInt((ms / (1000 * 60 * 60)) % 24)
  let days = parseInt(ms / (1000 * 60 * 60 * 24))

  return `${days}d ${hours}h ${minutes}m ${seconds}s`
}

function wish() {
  let wishloc = ""
  let time = moment.tz("Asia/Jakarta").format("HH")
  wishloc = "Hi"
  if (time >= 0) {
    wishloc = "Selamat Malam"
  }
  if (time >= 4) {
    wishloc = "Selamat Pagi"
  }
  if (time >= 11) {
    wishloc = "Selamat Siang"
  }
  if (time >= 15) {
    wishloc = "️Selamat Sore"
  }
  if (time >= 18) {
    wishloc = "Selamat Malam"
  }
  if (time >= 23) {
    wishloc = "Selamat Malam"
  }
  return wishloc
}

function getTime() {
  return new Date().toLocaleTimeString("en-US", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

const isNumber = (x) => typeof x === "number" && !isNaN(x)
const delay = (ms) =>
  isNumber(ms) &&
  new Promise((resolve) =>
    setTimeout(function () {
      clearTimeout(this)
      resolve()
    }, ms)
  )

function toRupiah(number) {
  return new Intl.NumberFormat("id-ID").format(number)
}

function generateRefID() {
  return "ry-" + Math.random().toString(36).substr(2, 9)
}

function formattedDate(ms) {
  return moment(ms).tz("Asia/Jakarta").format("DD/MM/YYYY")
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

async function resetAll() {
  try {
    const users = global.db?.data?.users || {}
    const chats = global.db?.data?.chats || {}

    for (const userId in users) {
      const user = users[userId]
      if (!user) continue

      if (typeof user.limit !== "number" || user.limit < 50) user.limit = 50

      if (user.chat && user.chat > 0) user.chat = 0

      if (user.command && user.command > 0) user.command = 0
    }

    for (const chatId in chats) {
      const chat = chats[chatId]
      if (!chat || !chat.member) continue

      const members = chat.member
      for (const memberId in members) {
        const member = members[memberId]
        if (!member) continue

        if (member.chat && member.chat > 0) member.chat = 0

        if (member.command && member.command > 0) member.command = 0
      }
    }
  } catch (error) {
    console.error("❌ Terjadi kesalahan saat melakukan reset:", error)
  }
}

async function resetCryptoPrice() {
  try {
    let invest = global.db.data.bots.invest.item
    let data = Object.keys(invest)
    for (let name of data) {
      invest[name].hargaBefore = invest[name].harga
    }
  } catch (error) {
    console.error("Terjadi kesalahan saat melakukan reset harga crypto:", error)
  }
}

async function resetSahamPrice() {
  try {
    let saham = global.db.data.bots.saham.item
    let data = Object.keys(saham)
    for (let name of data) {
      saham[name].hargaBefore = saham[name].harga
    }
  } catch (error) {
    console.error("Terjadi kesalahan saat melakukan reset harga saham:", error)
  }
}

async function newChartSaham() {
  try {
    let bot = global.db.data.bots
    let data = Object.keys(bot.saham.item)
    for (let v of data) {
      let dataCrypto = bot.saham.item[v]
      let newChart = Date.now()
      dataCrypto.volumeSell = 0
      dataCrypto.open = dataCrypto.harga
      dataCrypto.high = dataCrypto.harga
      dataCrypto.low = dataCrypto.harga
      dataCrypto.chart[newChart] = [dataCrypto.harga, dataCrypto.harga, dataCrypto.harga, dataCrypto.harga]
      dataCrypto.chartNow = newChart
    }
  } catch (error) {
    console.error("Terjadi kesalahan saat melakukan reset volume saham:", error)
  }
}

async function resetVolumeSaham() {
  try {
    let bot = global.db.data.bots
    let data = Object.keys(bot.saham.item)
    for (let v of data) {
      let dataCrypto = bot.saham.item[v]
      dataCrypto.volumeBuy = 0
      dataCrypto.volumeSell = 0
    }
  } catch (error) {
    console.error("Terjadi kesalahan saat melakukan reset volume saham:", error)
  }
}

async function Backup() {
  try {
    let setting = global.db.data.settings[conn.user.jid]
    if (setting.backup) {
      readdirSync("./")
        .filter((v) => /backupsc/i.test(v))
        .forEach((f) => rmSync(`./${f}`))

      const filename = `backupsc-${moment.tz("Asia/Jakarta").format("DD-MM-YYYY-HH-mm-ss")}.zip`

      const output = fs.createWriteStream(filename)
      const archive = archiver("zip", {
        zlib: { level: 9 },
      })

      const owner = global.config.owner[0][0] + "@s.whatsapp.net"
      output.on("close", async () => {
        await conn.sendFile(owner, filename, filename, "")
        fs.unlinkSync(filename)
      })

      archive.on("error", (err) => {
        throw err
      })

      archive.pipe(output)

      const sourceFolder = "./"
      const excludeFolders = ["node_modules", "tmp", "sessions"]

      archive.glob("**/*", {
        cwd: sourceFolder,
        ignore: excludeFolders.map((dir) => `${dir}/**`),
      })

      archive.finalize()
    }
  } catch (error) {
    console.error("Terjadi kesalahan saat melakukan backup:", error)
  }
}

async function newChartCrypto() {
  try {
    let bot = global.db.data.bots
    let data = Object.keys(bot.invest.item)
    for (let v of data) {
      let dataCrypto = bot.invest.item[v]
      let newChart = Date.now()
      dataCrypto.open = dataCrypto.harga
      dataCrypto.high = dataCrypto.harga
      dataCrypto.low = dataCrypto.harga
      dataCrypto.chart[newChart] = [dataCrypto.harga, dataCrypto.harga, dataCrypto.harga, dataCrypto.harga]
      dataCrypto.chartNow = newChart
    }
  } catch (error) {
    console.error("Terjadi kesalahan saat melakukan reset volume crypto:", error)
  }
}

async function resetVolumeCrypto() {
  try {
    let bot = global.db.data.bots
    let data = Object.keys(bot.invest.item)
    for (let v of data) {
      let dataCrypto = bot.invest.item[v]
      dataCrypto.volumeBuy = 0
      dataCrypto.volumeSell = 0
    }
  } catch (error) {
    console.error("Terjadi kesalahan saat melakukan reset volume crypto:", error)
  }
}

function clearMemory() {
  if (conn.spam) conn.spam = {}
  if (conn.khodam) conn.khodam = {}
  let bot = global.db.data.bots
  Object.keys(bot.replyText).forEach((id) => {
    if (Date.now() - bot.replyText[id]?.time > 86400000) {
      delete bot.replyText[id]
    }
  })
}

async function OtakuNews() {
  try {
    let chat = global.db.data.chats
    let bot = global.db.data.bots
    let data = await otakudesu.ongoing()

    if (!Array.isArray(data)) {
      console.error("Data returned is not an array")
      return
    }
    if (data.length == 0) {
      console.error("No ongoing anime found")
      return
    }

    if (data[0].title !== bot.otakuNow) {
      bot.otakuNow = data[0].title

      let groups = Object.entries(conn.chats)
        .filter(([jid, chat]) => jid.endsWith("@g.us") && chat.isChats)
        .map((v) => v[0])

      let { status, total_eps, duration, studio, genre, synopsis } = await otakudesu.detail(data[0].link)

      for (let v of groups) {
        if (!chat[v].otakuNews) continue

        chat[v].otakuNow = data[0].title

        let caption = `
*Otakudesu Update!*

Name : ${data[0].title} ( ${data[0].episode} )
Status : ${status}
Total Episode : ${total_eps}
Durasi : ${duration}
Studio : ${studio}
Genre : ${genre}
${
  synopsis
    ? `
Sinopsis : 
${synopsis}`
    : ""
}
                `.trim()

        await conn.sendFile(v, data[0].image, null, caption, null)
      }
    }
  } catch (error) {
    console.error("An error occurred in OtakuNews:", error.message)
  }
}

async function checkGempa(conn) {
  try {
    let chat = global.db.data.chats
    let bot = global.db.data.bots

    let apiResponse = await axios.get("https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json")
    let gempa = apiResponse.data.Infogempa.gempa

    if (gempa.DateTime !== bot.gempaDateTime) {
      bot.gempaDateTime = gempa.DateTime

      let groups = Object.entries(conn.chats)
        .filter(([jid, chat]) => jid.endsWith("@g.us") && chat.isChats)
        .map((v) => v[0])

      for (let number of groups) {
        if (chat[number].notifgempa && gempa.DateTime !== chat[number].gempaDateTime) {
          chat[number].gempaDateTime = gempa.DateTime

          let caption = `
*BMKG Notif Gempa!*

Koordinat: ${gempa.Coordinates}
Magnitude: ${gempa.Magnitude}
Kedalaman: ${gempa.Kedalaman}

_Wilayah: ${gempa.Wilayah}, Potensi: ${gempa.Potensi}_

_Dihimbau untuk warga yang berada di wilayah *${gempa.Dirasakan}* untuk selalu berhati-hati!_
                    `.trim()

          const imageBuffer = await conn.getFile("https://data.bmkg.go.id/DataMKG/TEWS/" + gempa.Shakemap)
          await conn.sendFile(number, imageBuffer.data, "map.jpg", caption, false)
          await delay(2000)
        }
      }
    }
  } catch (error) {
    console.error("An error occurred in checkGempa:", error.message)
  }
}

async function checkSewa(conn) {
  let chat = global.db.data.chats
  let data = Object.keys(chat).filter((v) => chat[v].expired > 0 && new Date().getTime() - chat[v].expired > 0)

  for (let number of data) {
    try {
      await conn.reply(
        number,
        `Waktunya *${conn.user.name}* Untuk Meninggalkan Group\n\n_Jika ingin Sewa lagi, silahkan hubungi owner!_\n\n${global.config.owner
          .map(([jid, name]) => {
            return `Name : ${name}\n wa.me/${jid}`.trim()
          })
          .join("\n\n")}`,
        null
      )
      await conn.groupLeave(number)

      chat[number].expired = 0
    } catch (error) {
      console.error(`Error while processing group ${number}:`, error.message)
      chat[number].expired = 0
    }
  }
}

async function checkPremium() {
  try {
    let user = global.db.data.users
    let data = Object.keys(user).filter((v) => user[v].premiumTime > 0 && new Date().getTime() - user[v].premiumTime > 0)

    for (let number of data) {
      try {
        user[number].premiumTime = 0
        user[number].premium = false
      } catch (error) {
        console.error(`Error while processing user ${number}:`, error.message)
      }
    }
  } catch (error) {
    console.error("An error occurred in checkPremium:", error.message)
  }
}

async function updateSaham() {
  let bot = global.db.data.bots
  let persen = [0.01, 0.02]
  let invest = Object.entries(bot.saham.item)

  for (let [name, value] of invest) {
    const marketCapHarga = value.marketcap * value.harga

    if (marketCapHarga > 0 && marketCapHarga <= 500000000000) {
      value.rise = ["naik", "stay", "stay", "stay", "turun"]
    } else if (marketCapHarga > 500000000000 && marketCapHarga <= 1000000000000) {
      value.rise = ["naik", "stay", "stay", "stay", "stay", "turun"]
    } else if (marketCapHarga > 1000000000000 && marketCapHarga <= 10000000000000) {
      value.rise = ["naik", "stay", "stay", "stay", "stay", "stay", "turun"]
    } else if (marketCapHarga > 10000000000000) {
      value.rise = ["naik", "stay", "stay", "stay", "stay", "stay", "stay", "turun"]
    }

    let volNaik = value.rise.filter((v) => v === "naik").length
    let volTurun = value.rise.filter((v) => v === "turun").length

    let volBuy = value.volumeBuy && value.open ? (30 / 100) * value.volumeBuy * value.open : 0
    let volSell = value.volumeSell && value.open ? (20 / 100) * value.volumeSell * value.open : 0

    if (value.volumeBuy - value.volumeSell > volBuy && volNaik === 1) {
      value.rise.push("naik")
    } else if (value.volumeSell - value.volumeBuy > volSell && volTurun === 1) {
      value.rise.push("turun")
    } else if (value.volumeBuy - value.volumeSell < volBuy && volNaik === 2) {
      value.rise = value.rise.filter((v) => v !== "naik")
    } else if (value.volumeSell - value.volumeBuy < volSell && volTurun === 2) {
      value.rise = value.rise.filter((v) => v !== "turun")
    }

    let isPersen = persen[Math.floor(Math.random() * persen.length)]
    let onePercent = Math.round(value.harga * isPersen)
    let isRise = value.rise[Math.floor(Math.random() * value.rise.length)]

    if (onePercent < 1) onePercent = 1

    if (isRise === "naik") {
      value.harga += onePercent
    } else if (isRise === "turun" && value.harga - onePercent > 0) {
      value.harga -= onePercent
    }

    let chartNow = value.chartNow

    if (value.harga > value.high) {
      value.high = value.harga
    }

    if (value.harga < value.low || value.low === undefined) {
      value.low = value.harga
    }

    value.chart[chartNow] = [value.open, value.high, value.low, value.harga]
  }
}

function clearTmp() {
  let __dirname = Helper.__dirname(import.meta.url)
  let tmp = [os.tmpdir(), path.join(__dirname, "../tmp")]
  let filenames = []
  tmp.forEach((dirname) => {
    try {
      fs.readdirSync(dirname).forEach((file) => filenames.push(path.join(dirname, file)))
    } catch (err) {
      console.error(`Error reading directory ${dirname}:`, err)
    }
  })

  filenames.forEach((file) => {
    try {
      let stats = fs.statSync(file)
      if (stats.isFile() && Date.now() - stats.mtimeMs >= 1000 * 60 * 5) {
        fs.unlinkSync(file)
      }
    } catch (err) {
      console.error(`Error processing file ${file}:`, err)
    }
  })
}

async function updateCrypto() {
  let bot = global.db.data.bots
  let persen = [0.01, 0.02]
  let invest = Object.entries(bot.invest.item)

  for (let [name, value] of invest) {
    const marketCapHarga = value.marketcap * value.harga

    if (marketCapHarga > 0 && marketCapHarga <= 200000000000) {
      value.rise = ["naik", "stay", "stay", "turun"]
    } else if (marketCapHarga > 200000000000 && marketCapHarga <= 500000000000) {
      value.rise = ["naik", "stay", "stay", "stay", "turun"]
    } else if (marketCapHarga > 500000000000 && marketCapHarga <= 1000000000000) {
      value.rise = ["naik", "stay", "stay", "stay", "stay", "turun"]
    } else if (marketCapHarga > 1000000000000 && marketCapHarga <= 10000000000000) {
      value.rise = ["naik", "stay", "stay", "stay", "stay", "stay", "turun"]
    } else if (marketCapHarga > 10000000000000) {
      value.rise = ["naik", "stay", "stay", "stay", "stay", "stay", "stay", "turun"]
    }

    let volNaik = value.rise.filter((v) => v === "naik").length
    let volTurun = value.rise.filter((v) => v === "turun").length

    let volBuy = value.volumeBuy && value.open ? (30 / 100) * value.volumeBuy * value.open : 0
    let volSell = value.volumeSell && value.open ? (20 / 100) * value.volumeSell * value.open : 0

    if (value.volumeBuy - value.volumeSell > volBuy && volNaik === 1) {
      value.rise.push("naik")
    } else if (value.volumeSell - value.volumeBuy > volSell && volTurun === 1) {
      value.rise.push("turun")
    } else if (value.volumeBuy - value.volumeSell < volBuy && volNaik === 2) {
      value.rise = value.rise.filter((v) => v !== "naik")
    } else if (value.volumeSell - value.volumeBuy < volSell && volTurun === 2) {
      value.rise = value.rise.filter((v) => v !== "turun")
    }

    let isPersen = persen[Math.floor(Math.random() * persen.length)]
    let onePercent = Math.round(value.harga * isPersen)
    let isRise = value.rise[Math.floor(Math.random() * value.rise.length)]

    if (onePercent < 1) onePercent = 1

    if (value.harga <= 1) continue

    if (isRise === "naik") {
      value.harga += onePercent
    } else if (isRise === "turun" && value.harga - onePercent > 0) {
      value.harga -= onePercent
    }

    let chartNow = value.chartNow

    if (value.harga > value.high) {
      value.high = value.harga
    }

    if (value.harga < value.low || value.low === undefined) {
      value.low = value.harga
    }

    value.chart[chartNow] = [value.open, value.high, value.low, value.harga]
  }
}

async function checkSholat(conn) {
  try {
    const groups = Object.entries(conn.chats)
      .filter(([jid, chat]) => jid.endsWith("@g.us") && chat.isChats)
      .map((v) => v[0])
    const now = getTime()
    for (const group of groups) {
      const { notifAdzan, notifSholat } = global.db.data.chats[group]
      if (notifAdzan) {
        const { kota, jadwalSholat, currentPrayer } = notifSholat
        const jadwalSholatKeys = Object.keys(jadwalSholat)
        for (const jadwal of jadwalSholatKeys) {
          if (jadwalSholat[jadwal] === now && currentPrayer !== jadwal) {
            global.db.data.chats[group].notifSholat.currentPrayer = jadwal
            await createAzanImage(/dhuha|imsak/i.test(jadwal) ? `Waktu ${capitalize(jadwal)} Sudah Tiba!` : `Adzan ${capitalize(jadwal)} Sudah Berkumandang!`, `Untuk Wilayah ${kota}`)
            const thumbnail = fs.readFileSync("./media/adzan.png")
            const { reminders } = JSON.parse(fs.readFileSync("./json/reminders.json"))
            let caption = `*${/dhuha|imsak/i.test(jadwal) ? `Waktu ${capitalize(jadwal)} Sudah Tiba!` : `Adzan ${capitalize(jadwal)} Sudah Berkumandang!`}*\n\n`
            caption += `Wilayah: *${kota}*\n`
            caption += `Waktu: *${now}*\n\n`
            caption += reminders[Math.floor(Math.random() * reminders.length)].message
            await conn.adReply(group, caption, /dhuha|imsak/i.test(jadwal) ? `Waktu ${capitalize(jadwal)} Sudah Tiba!` : `Adzan ${capitalize(jadwal)} Sudah Berkumandang!`, `Untuk Wilayah ${kota}`, thumbnail, global.config.website, false)
            await delay(2000)
          }
        }
      }
    }
  } catch (error) {
    console.error("An error occurred in checkSholat:", error.message)
  }
}

async function checkPembayaran() {
  try {
    if (!conn.pembayaran) conn.pembayaran = {}
    if (conn.pembayaranProses) return
    conn.pembayaranProses = true
    let data = Object.keys(conn.pembayaran)
    for (let key of data) {
      try {
        let user = global.db.data.users[key]
        let name = user.registered ? user.name : await conn.getName(key)
        let { key: chatKey, chat, type, refID, code, produk, harga, number, time, expired } = conn.pembayaran[key]

        const bot = global.db.data.bots
        const transaksi = bot.transaksi[refID]

        if (!transaksi) return

        const isSuccessStatus = transaksi.status === "settlement"

        if (isSuccessStatus) {
          if (/limitjb/i.test(code)) {
            let limit = Number(code.replace("limitjb", ""))
            if (limit < 1) return m.reply("Limit tidak boleh kurang dari 1")
            if (limit > 100) return m.reply("Limit tidak boleh lebih dari 100")
            let caption = await getCaption("Sukses", refID, produk, harga, "")
            let image = imageTransaksi("Sukses")
            await conn.adReply(chat, caption, `Halo ${name}, ${wish()}`, global.config.watermark, image, global.config.website, null)
            user.limitjb += limit
            conn.sendMessage(chat, { delete: chatKey })
            clearTimeout(expired)
            delete conn.pembayaran[key]
            user.historyTrx.push({ status: true, trxId: refID, nominal: harga, type: produk, time: Date.now() })
            return
          } else if (/ppj/i.test(code)) {
            let groupData = global.db.data.chats[number]
            let groupName = await conn.getName(number)
            let hari = Number(code.replace("ppj", ""))
            let caption = await getCaption("Sukses", refID, produk, harga, "")
            let image = imageTransaksi("Sukses")
            await conn.adReply(chat, caption, `Halo ${name}, ${wish()}`, global.config.watermark, image, global.config.website, null)
            let jumlahHari = 86400000 * hari
            let now = Date.now()
            groupData.expired = now < groupData.expired ? groupData.expired + jumlahHari : now + jumlahHari
            let timers = groupData.expired - now
            await conn.reply(
              global.config.owner[0][0] + "@s.whatsapp.net",
              `
✔️ Success Perpanjangan Group ${groupName}
📛 *Name:* ${name}
👨‍👩‍👧‍👦 *Group:* ${groupName}
📆 *Days:* ${hari} days
📉 *Countdown:* ${msToTime(timers)}
`.trim()
            )
            user.historyTrx.push({ status: true, trxId: refID, nominal: harga, type: produk, time: Date.now() })
            conn.sendMessage(chat, { delete: chatKey })
            clearTimeout(expired)
            delete conn.pembayaran[key]
          } else if (/prem/i.test(code)) {
            let hari = Number(code.replace("prem", ""))
            let caption = await getCaption("Sukses", refID, produk, harga, "")
            let image = imageTransaksi("Sukses")
            await conn.adReply(chat, caption, `Halo ${name}, ${wish()}`, global.config.watermark, image, global.config.website, null)
            let jumlahHari = 86400000 * hari
            let now = Date.now()
            user.premiumTime = now < user.premiumTime ? user.premiumTime + jumlahHari : now + jumlahHari
            user.premium = true
            let timers = user.premiumTime - now
            await conn.reply(
              global.config.owner[0][0] + "@s.whatsapp.net",
              `
✔️ Success
📛 *Name:* ${name}
📆 *Days:* ${hari} days
📉 *Countdown:* ${msToTime(timers)}
`.trim()
            )
            user.historyTrx.push({ status: true, trxId: refID, nominal: harga, type: produk, time })
            conn.sendMessage(chat, { delete: chatKey })
            clearTimeout(expired)
            delete conn.pembayaran[key]
          } else if (/donasi|deposit/i.test(type)) {
            let caption = `
*TRANSAKSI SUKSES!*

Nominal : Rp.${toRupiah(harga)}
Type : ${capitalize(type)}
${capitalize(type)} : +Rp ${toRupiah(harga)}
${capitalize(type)} Sekarang : Rp ${toRupiah(user[type] + harga)}
Waktu Penyelesaian : ${formattedDate(Date.now())}

_Terimakasih Sudah ${type === "donasi" ? "Berdonasi" : "Mendeposit"} Ke *${conn.user.name}* Dan Terimakasih Atas Kepercayaan-Nya!_
`.trim()
            let image = fs.readFileSync(`./media/${type}.jpg`)
            await conn.adReply(chat, caption, `Halo ${name}, ${wish()}`, global.config.watermark, image, global.config.website, null)
            user[type] += harga
            user.historyTrx.push({ status: true, trxId: refID, nominal: harga, type, time })
            conn.sendMessage(chat, { delete: chatKey })
            clearTimeout(expired)
            delete conn.pembayaran[key]
          } else {
            orderProduk(code, refID, number)
              .then(async (v) => {
                try {
                  let status = v.data.status
                  let caption = await getCaption("Pending", refID, produk, harga, v.data.sn)
                  let image = await imageTransaksi("Pending")
                  if (typeof global.db.data.bots.refID[refID] !== "undefined") return
                  global.db.data.bots.refID[refID] = true
                  if (!/Pending|Sukses|Gagal/i.test(status)) {
                    image = await imageTransaksi(status)
                    caption = await getCaption(status, refID, produk, harga, v.data.sn)
                    await conn.adReply(chat, caption, `Halo ${name}, ${wish()}`, global.config.watermark, image, global.config.website, null)
                    user.historyTrx.push({ status: false, trxId: refID, nominal: harga, type: "refund", time: Date.now() })
                    user.deposit += harga
                    conn.sendMessage(chat, { delete: chatKey })
                    clearTimeout(expired)
                    delete conn.pembayaran[key]
                    return
                  }
                  if (status == "Sukses") {
                    image = await imageTransaksi(status)
                    caption = await getCaption(status, refID, produk, harga, v.data.sn)
                    await conn.adReply(chat, caption, `Halo ${name}, ${wish()}`, global.config.watermark, image, global.config.website, null)
                    user.historyTrx.push({ status: true, trxId: refID, nominal: harga, type: produk, time: Date.now() })
                    conn.sendMessage(chat, { delete: chatKey })
                    clearTimeout(expired)
                    delete conn.pembayaran[key]
                    return
                  } else if (status == "Gagal") {
                    image = await imageTransaksi(status)
                    caption = await getCaption(status, refID, produk, harga, v.data.sn)
                    await conn.adReply(chat, caption, `Halo ${name}, ${wish()}`, global.config.watermark, image, global.config.website, null)
                    user.historyTrx.push({ status: false, trxId: refID, nominal: harga, type: "refund", time: Date.now() })
                    user.deposit += harga
                    conn.sendMessage(chat, { delete: chatKey })
                    clearTimeout(expired)
                    delete conn.pembayaran[key]
                    return
                  }
                  await conn.adReply(chat, caption, `Halo ${name}, ${wish()}`, global.config.watermark, image, global.config.website, null)
                  while (status !== "Sukses" && status !== "Gagal") {
                    if (status !== "Pending") return
                    await delay(5000)
                    let i = await orderProduk(code, refID, number)
                    status = i.data.status
                    if (status == "Sukses") {
                      image = await imageTransaksi(status)
                      caption = await getCaption(status, refID, produk, harga, i.data.sn)
                      await conn.adReply(chat, caption, `Halo ${name}, ${wish()}`, global.config.watermark, image, global.config.website, null)
                      user.historyTrx.push({ status: true, trxId: refID, nominal: harga, type: produk, time: Date.now() })
                      conn.sendMessage(chat, { delete: chatKey })
                      clearTimeout(expired)
                      delete conn.pembayaran[key]
                      break
                    } else if (status == "Gagal") {
                      image = await imageTransaksi(status)
                      caption = await getCaption(status, refID, produk, harga, i.data.sn)
                      await conn.adReply(chat, caption, `Halo ${name}, ${wish()}`, global.config.watermark, image, global.config.website, null)
                      user.historyTrx.push({ status: false, trxId: refID, nominal: harga, type: "refund", time: Date.now() })
                      user.deposit += harga
                      conn.sendMessage(chat, { delete: chatKey })
                      clearTimeout(expired)
                      delete conn.pembayaran[key]
                      break
                    }
                  }
                } catch (error) {
                  console.error(`Error processing order: ${error}`)
                }
              })
              .catch((error) => {
                console.error(`Error placing order: ${error}`)
              })
          }
        }
      } catch (error) {
        console.error(`Error processing payment for user ${key}: ${error}`)
      }
    }
  } catch (error) {
    console.error(`Error checking payments: ${error}`)
  } finally {
    delete conn.pembayaranProses
  }
}

async function cekSaldoDG() {
  try {
    let result = await cekSaldo()
    let bot = global.db.data.bots
    if (result.data.deposit <= 10000 && bot.cekSaldoDG == false) {
      let owner = global.config.owner[0][0] + "@s.whatsapp.net"
      let caption = `
*Halo Owner!*

*🪙 Saldo* : Rp ${toRupiah(result.data.deposit)}
*📆 Tanggal* : ${formattedDate(Date.now())}
*📛 Status* : Saldo Deposit Kurang Dari Rp 10.000

*Silahkan Top Up Saldo Deposit Anda!*
`.trim()
      await conn.reply(owner, caption, null)
      bot.cekSaldoDG = true
    } else if (result.data.deposit > 10000 && bot.cekSaldoDG == true) {
      bot.cekSaldoDG = false
    }
    console.log(`Saldo Deposit Digiflazz: Rp ${toRupiah(result.data.deposit)}`)
  } catch (error) {
    console.error(`Error checking deposit: ${error}`)
  }
}

async function openAndCloseGC(conn) {
  const groups = Object.entries(conn.chats)
    .filter(([jid, chat]) => jid.endsWith("@g.us") && chat.isChats)
    .map((v) => v[0])
  const time = getTime()

  for (let key of groups) {
    const chat = global.db.data.chats[key]

    const startTime = moment(time, "HH:mm")

    if (chat.opentime != "") {
      const endTime = moment(chat.opentime, "HH:mm")
      const diffInMinutes = endTime.diff(startTime, "minutes")
      if (diffInMinutes == 5) {
        await conn.reply(key, "Group akan segera dibuka, dalam 5 menit lagi", null)
      }
      if (time == chat.opentime) {
        await conn.reply(key, `Group dibuka karena sudah jam ${chat.opentime} ${chat.closetime ? `dan akan tutup pukul ${chat.closetime}` : ""}`.trim())
        await conn.groupSettingUpdate(key, "not_announcement")
        continue
      }
    }
    if (chat.closetime != "") {
      const endTime = moment(chat.closetime, "HH:mm")
      const diffInMinutes = endTime.diff(startTime, "minutes")
      if (diffInMinutes == 5) {
        await conn.reply(key, "Group akan segera ditutup, dalam 5 menit lagi", null)
      }
      if (time == chat.closetime) {
        await conn.reply(key, `Group ditutup karena sudah jam ${chat.closetime} ${chat.opentime ? `dan akan dibuka pukul ${chat.opentime}` : ""}`.trim())
        await conn.groupSettingUpdate(key, "announcement")
      }
    }
  }
}

export { resetAll, resetSahamPrice, resetCryptoPrice, Backup, resetVolumeSaham, resetVolumeCrypto, clearMemory, OtakuNews, checkGempa, updateSaham, checkPremium, checkSewa, clearTmp, updateCrypto, checkSholat, newChartCrypto, newChartSaham, checkPembayaran, cekSaldoDG, openAndCloseGC }
