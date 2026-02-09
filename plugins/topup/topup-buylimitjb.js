import { createQris } from "../../lib/midtrans.js"
import moment from "moment-timezone"

const listharga = `
Harga Topup:
1JB = Rp 500

Bundle Harga:
5JB = Rp 2.250
10JB = Rp 4.000
20JB = Rp 7.500
30JB = Rp 10.000
`.trim()
let handler = async (m, { senderKey, conn, user, args, usedPrefix, command }) => {
  conn.pembayaran = conn.pembayaran || {}

  if (!args[0]) return m.reply(`${listharga}\n\nContoh: \n${usedPrefix + command} 10`)
  let jumlah = args[0].replace(/[^0-9]/g, "")
  if (isNaN(jumlah)) return m.reply(`Jumlah harus berupa angka!\n\nContoh:\n${usedPrefix + command} 10\n\n${listharga}`)
  if (jumlah < 1) return m.reply(`Minimal topup 1JB\n\nContoh:\n${usedPrefix + command} 10\n\n${listharga}`)
  if (jumlah > 1000) return m.reply(`Maksimal topup 1000JB\n\nContoh:\n${usedPrefix + command} 10\n\n${listharga}`)
  let harga = 500 * jumlah
  if (jumlah >= 5) harga = 2250 * Math.floor(jumlah / 5) + 500 * (jumlah % 5)
  if (jumlah >= 10) harga = 4000 * Math.floor(jumlah / 10) + 2250 * Math.floor((jumlah % 10) / 5) + 500 * ((jumlah % 10) % 5)
  if (jumlah >= 20) harga = 7500 * Math.floor(jumlah / 20) + 4000 * Math.floor((jumlah % 20) / 10) + 2250 * Math.floor(((jumlah % 20) % 10) / 5) + 500 * (((jumlah % 20) % 10) % 5)
  if (jumlah >= 30) harga = 10000 * Math.floor(jumlah / 30) + 7500 * Math.floor((jumlah % 30) / 20) + 4000 * Math.floor(((jumlah % 30) % 20) / 10) + 2250 * Math.floor((((jumlah % 30) % 20) % 10) / 5) + 500 * ((((jumlah % 30) % 20) % 10) % 5)

  await conn.textOptions(
    m.chat,
    `Silahkan pilih metode pembayaran dibawah ini:\n\nNominal: Rp ${toRupiah(harga)}\nJumlah: ${jumlah}JB`,
    false,
    [
      [`${usedPrefix}pembayaran limitjb${jumlah}|${senderKey}|${harga}|Pembelian Limit JB|deposit`, "Deposit"],
      [`${usedPrefix}pembayaran limitjb${jumlah}|${senderKey}|${harga}|Pembelian Limit JB|qris`, "Qris"],
    ],
    m
  )
}
handler.help = ["buylimitjb"]
handler.tags = ["topup"]
handler.command = /^(buylimit(jb|jadibot))$/i
export default handler

const toRupiah = (number) => parseInt(number).toLocaleString("id-ID")

function formatTimestampToWIB(timestamp) {
  const date = new Date(timestamp)
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
    timeZoneName: "short",
  }
  return date.toLocaleString("id-ID", options)
}

function sumNominal(transactions) {
  return transactions.reduce((total, transaction) => {
    return total + Number(transaction.nominal)
  }, 0)
}
