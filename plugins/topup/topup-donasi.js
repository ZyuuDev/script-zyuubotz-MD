import { createQris } from "../../lib/midtrans.js"
import moment from "moment-timezone"

let handler = async (m, { senderKey, conn, command, usedPrefix, text }) => {
  conn.pembayaran = conn.pembayaran || {}

  if (!process.env.MIDTRANS_SERVER_KEY || !process.env.MIDTRANS_CLIENT_KEY) {
    return m.reply("Fitur ini tidak dapat digunakan karena Midtrans belum diatur")
  }

  if (/cancel/i.test(text)) {
    if (typeof conn.pembayaran[senderKey] === "undefined") return m.reply("Kamu Tidak Mempunyai Transaksi Yang Berjalan!")
    await m.reply("Berhasil Menghapus Transaksi!")
    await conn.sendMessage(m.chat, { delete: conn.pembayaran[senderKey].key })
    clearTimeout(conn.pembayaran[senderKey].expired)
    delete conn.pembayaran[senderKey]
    return
  } else if (isNaN(text)) {
    return m.reply(`Masukkan Nominal! \n\nContoh: \n${usedPrefix + command} 1000`)
  }

  if (!text) return m.reply(`Masukan Nominal! \n\nContoh: \n${usedPrefix + command} 1000`)
  if (senderKey in conn.pembayaran) return m.reply("Kamu masih memiliki transaksi yang belum selesai!")
  if (text < 1000) return m.reply("Minimal 1000")
  if (text > 10000000) return m.reply("Maximal 10.000.000")

  let refID = generateRefID()
  let harga = parseInt(text)

  let qris = await createQris(harga, refID)

  let caption = `
*TRANSAKSI TELAH DIBUAT*

Nominal : Rp ${toRupiah(harga)}
Type : Donasi
Dibuat : ${formattedDate(Date.now())}
Expired : 15 Menit

_Silahkan Scan QRIS di atas dengan nominal *Rp.${toRupiah(harga)}* yang telah ditentukan! Jika sudah transaksi akan otomatis selesai_

_*Note :* Tidak boleh melebihi atau kurang dari nominal tersebut, karena transaksi dicek oleh BOT!_
`.trim()

  const sent = await conn.textOptions(m.chat, caption, qris.actions[0].url, [[`${usedPrefix + command} cancel`, "Cancel"]], m)

  conn.pembayaran[senderKey] = {
    key: sent.key,
    chat: m.chat,
    type: "donasi",
    refID,
    code: "donasi",
    produk: "donasi",
    harga,
    number: senderKey.split("@")[0],
    time: Date.now(),
    expired: setTimeout(async () => {
      await m.reply("Transaksi telah Expired!")
      await conn.sendMessage(m.chat, { delete: sent.key })
      delete conn.pembayaran[senderKey]
    }, 15 * 60 * 1000),
  }

  global.db.data.bots.transaksi[refID] = {
    status: qris.transaction_status,
  }
}

handler.help = ["donasi"]
handler.tags = ["topup"]
handler.command = /^(donasi)$/i
export default handler

function toRupiah(number) {
  return new Intl.NumberFormat("id-ID").format(number)
}

function generateRefID() {
  return "ry-" + Math.random().toString(36).substr(2, 9)
}

function formattedDate(ms) {
  return moment(ms).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm")
}
