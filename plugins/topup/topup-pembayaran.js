import { createQris } from "../../lib/midtrans.js"
import { getProduk, orderProduk } from "../../lib/digiflazz.js"
import moment from "moment-timezone"
import fs from "fs"

let handler = async (m, { senderKey, conn, usedPrefix, command, text }) => {
  let [code, number, harga, produk, payment, cancel] = text.split("|")
  switch (payment) {
    case "qris": {
      if (!conn.pembayaran) conn.pembayaran = {}

      if (cancel) {
        if (typeof conn.pembayaran[senderKey] === "undefined") return m.reply("Kamu Tidak Mempunyai Transaksi Yang Berjalan!")
        await m.reply("Berhasil Menghapus Transaksi!")
        await conn.sendMessage(m.chat, { delete: conn.pembayaran[senderKey].key })
        clearTimeout(conn.pembayaran[senderKey].expired)
        delete conn.pembayaran[senderKey]
        return
      }

      if (typeof conn.pembayaran[senderKey] !== "undefined") return m.reply("Kamu Masih Mempunyai Transaksi Yang Berjalan!")
      let item = await getProduk(code)
      if (!/prem|ppj|limitjb/i.test(code) && !(item.buyer_product_status || item.seller_product_status)) return m.reply("Status item ini Tidak Ready!")

      if (item) {
        harga = Number(item.price)
      } else {
        harga = Number(harga)
      }

      let refID = generateRefID()

      let qris = await createQris(harga, refID)

      let caption = `
*TRANSAKSI TELAH DIBUAT*

Produk : ${produk}
Harga : Rp ${toRupiah(harga)}
Dibuat : ${formattedDate(Date.now())}
Expired : 15 Menit

_Silahkan Scan QRIS di atas dengan nominal *Rp.${toRupiah(harga)}* yang telah ditentukan! Jika sudah, transaksi akan otomatis selesai._

_*Note :* Tidak boleh melebihi atau kurang dari nominal tersebut, karena transaksi dicek oleh BOT!_
`.trim()

      const sent = await conn.textOptions(m.chat, caption, qris.actions[0].url, [[`${usedPrefix + command} ${code}|${number}|${harga}|${produk}|qris|cancel`, "Cancel"]], m)
      conn.pembayaran[senderKey] = {
        key: sent.key,
        chat: m.chat,
        type: "qris",
        refID,
        code,
        produk,
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

      break
    }
    case "deposit": {
      let user = global.db.data.users[senderKey]
      let refID = generateRefID()
      let item = await getProduk(code)
      if (item) harga = Number(item.price)
      let name = user.registered ? user.name : m.name

      if (!/prem|ppj|limitjb/i.test(code) && !(item.buyer_product_status || item.seller_product_status)) return m.reply("Status item ini Tidak Ready!")
      if (user.deposit < harga) return m.reply(`Saldo Deposit kamu tidak mencukupi untuk membeli ini! Silahkan deposit dahulu menggunakan command *${usedPrefix}deposit*`)

      if (item) {
        harga = Number(item.price)
      } else {
        harga = Number(harga)
      }

      if (/limitjb/i.test(code)) {
        let limit = Number(code.replace("limitjb", ""))
        if (limit < 1) return m.reply("Limit tidak boleh kurang dari 1")
        if (limit > 100) return m.reply("Limit tidak boleh lebih dari 100")
        let caption = await getCaption("Sukses", refID, produk, harga, "")
        let image = imageTransaksi("Sukses")
        await conn.adReply(m.chat, caption, `Halo ${name}, ${wish()}`, global.config.watermark, image, global.config.website, null)
        user.limitjb += limit
        user.historyTrx.push({ status: true, trxId: refID, nominal: harga, type: produk, time: Date.now() })
        return
      } else if (/ppj/i.test(code)) {
        let groupData = global.db.data.chats[m.chat]
        let groupName = await conn.getName(senderKey)
        let hari = Number(code.replace("ppj", ""))
        let caption = await getCaption("Sukses", refID, produk, harga, "")
        let image = imageTransaksi("Sukses")
        await conn.adReply(m.chat, caption, `Halo ${name}, ${wish()}`, global.config.watermark, image, global.config.website, null)
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
      } else if (/prem/i.test(code)) {
        let hari = Number(code.replace("prem", ""))
        let caption = await getCaption("Sukses", refID, produk, harga, "")
        let image = imageTransaksi("Sukses")
        await conn.adReply(m.chat, caption, `Halo ${name}, ${wish()}`, global.config.watermark, image, global.config.website, null)
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
        await conn.adReply(m.chat, caption, `Halo ${name}, ${wish()}`, global.config.watermark, image, global.config.website, null)
        user[type] += harga
        user.historyTrx.push({ status: true, trxId: refID, nominal: harga, type, time })
      } else {
        orderProduk(code, refID, number).then(async (v) => {
          let status = v.data.status
          let caption = await getCaption("Pending", refID, item.product_name, item.price, user.deposit, v.data.sn)
          let image = await imageTransaksi("Pending")
          if (!/Pending|Sukses|Gagal/i.test(status)) {
            image = await imageTransaksi(status)
            caption = await getCaption(status, refID, produk, harga, v.data.sn)
            await conn.adReply(m.chat, caption, `Halo ${name}, ${wish()}`, global.config.watermark, image, global.config.website, m)
            user.historyTrx.push({ status: false, trxId: refID, nominal: harga, type: "refund", time: Date.now() })
            return
          }
          if (status == "Sukses") {
            image = await imageTransaksi(status)
            caption = await getCaption(status, refID, produk, harga, v.data.sn)
            await conn.adReply(m.chat, caption, `Halo ${name}, ${wish()}`, global.config.watermark, image, global.config.website, m)
            user.historyTrx.push({ status: true, trxId: refID, nominal: harga, type: produk, time: Date.now() })
            user.deposit -= harga
            return
          } else if (status == "Gagal") {
            image = await imageTransaksi(status)
            caption = await getCaption(status, refID, produk, harga, v.data.sn)
            await conn.adReply(m.chat, caption, `Halo ${name}, ${wish()}`, global.config.watermark, image, global.config.website, m)
            user.historyTrx.push({ status: false, trxId: refID, nominal: harga, type: "refund", time: Date.now() })
            return
          }
          await conn.adReply(m.chat, caption, `Halo ${m.name}, ${wish()}`, global.config.watermark, image, global.config.website, m)
          while (status !== "Sukses" && status !== "Gagal") {
            await delay(5000)
            let i = await orderProduk(code, refID, number)
            status = i.data.status
            if (status == "Sukses") {
              image = await imageTransaksi(status)
              caption = await getCaption(status, refID, item.product_name, item.price, user.deposit, i.data.sn)
              await conn.adReply(m.chat, caption, `Halo ${m.name}, ${wish()}`, global.config.watermark, image, global.config.website, m)
              user.historyTrx.push({ status: true, trxId: refID, nominal: item.price, type: item.product_name, time: Date.now() })
              user.deposit -= harga
              break
            } else if (status == "Gagal") {
              image = await imageTransaksi(status)
              caption = await getCaption(status, refID, item.product_name, item.price, user.deposit, i.data.sn)
              await conn.adReply(m.chat, caption, `Halo ${m.name}, ${wish()}`, global.config.watermark, image, global.config.website, m)
              user.historyTrx.push({ status: false, trxId: refID, nominal: item.price, type: "refund", time: Date.now() })
              break
            }
          }
        })
      }
      break
    }
    default:
      await conn.textList(
        m.chat,
        `Silahkan Pilih Metode Pembayaran Kamu!`,
        false,
        [
          [`${usedPrefix + command} ${code}|${number}|${harga}|${produk}|qris`, "1", "QRIS"],
          [`${usedPrefix + command} ${code}|${number}|${harga}|${produk}|deposit`, "2", "Deposit"],
        ],
        m
      )
  }
}
handler.command = /(pembayaran)/i
export default handler

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
  return moment(ms).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm")
}

function wish() {
  let wishloc = ""
  const time = moment.tz("Asia/Jakarta").format("HH")
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

function getCaption(status, refID, produk, harga, userDeposit, sn) {
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
Harga : Rp ${toRupiah(harga)}
Status : ${status} ${
    status == "Sukses"
      ? `
Saldo : - Rp ${toRupiah(harga)}
Sisa Saldo : Rp ${toRupiah(userDeposit - harga)}`
      : ""
  }
Waktu : ${formattedDate(Date.now())}

_Pembelian ${produk} ${status}!_ ${desc[status]}
`.trim()
  return caption
}

function imageTransaksi(status) {
  let image = {
    Pending: "pembayaran_diproses.png",
    Sukses: "pembayaran_berhasil.png",
    Gagal: "pembayaran_gagal.png",
  }
  return fs.readFileSync(`./media/${image[status]}`)
}

function getRandomNumber() {
  return Math.floor(Math.random() * 100) + 1
}
