import { getProduk, cekSaldo } from "../../lib/digiflazz.js"
import crypto from "crypto"
import fetch from "node-fetch"

let handler = async (m, { conn, usedPrefix, command, text }) => {
    let [code, number] = text.split("|")
    if (code && number) {
        let item = await getProduk(code)
        if (!item) return m.reply("Kode Produk Tersebut Tidak Ditemukan!")
        if (!(item.buyer_product_status && item.seller_product_status)) return m.reply("Status item ini Tidak Ready!")
        let metadata = toSHA256(m.quoted?.text || "")
        let replyText = global.db.data.bots.replyText[metadata] || {}
        let head = `${number.startsWith("08") ? "Nomor" : "ID"} : ${number}`

        if (/MOBILE LEGENDS/i.test(item.brand)) {
            try {
                let numbers = number.match(/\d+/g)
                if (numbers.length < 2) return m.reply(`ID Mobile Legends tidak valid!`).then(() => replyText.input = false)
                let req = await fetch(global.API("lol", `/api/mobilelegend/${numbers[0]}/${numbers[1]}`, null, "apikey"))
                let json = await req.json()
                head = json.result == "error" ? `ID : ${number}` : `Nickname : ${json.result}`
                number = numbers.join('')
            } catch (error) {
                console.error(error)
                return m.reply(`Terjadi kesalahan saat memeriksa ID ${item.brand}`).then(() => replyText.input = false)
            }
        } else if (/FREE FIRE/i.test(item.brand)) {
            try {
                let req = await fetch(global.API("lol", `/api/freefire/${number}`, null, "apikey"))
                let json = await req.json()
                head = json.result == "error" ? `ID : ${number}` : `Nickname : ${json.result}`
            } catch (error) {
                console.error(error)
                return m.reply(`Terjadi kesalahan saat memeriksa ID ${item.brand}`).then(() => replyText.input = false)
            }
        } else if (/Genshin Impact/i.test(item.brand)) {
            try {
                let req = await fetch(global.API("https://enka.network", `/api/uid/${number}`))
                let json = await req.json()
                head = `Nickname : ${json.playerInfo.nickname}`
                number = `${number}`
            } catch (error) {
                console.error(error)
                return m.reply(`Terjadi kesalahan saat memeriksa ID ${item.brand}`).then(() => replyText.input = false)
            }
        } else if (/Call of Duty MOBILE/i.test(item.brand)) {
            try {
                let req = await fetch(global.API("lol", `/api/codm/${number}`, null, "apikey"))
                let json = await req.json()
                head = json.result == "error" ? `ID : ${number}` : `Nickname : ${json.result}`
            } catch (error) {
                console.error(error)
                return m.reply(`Terjadi kesalahan saat memeriksa ID ${item.brand}`).then(() => replyText.input = false)
            }
        }

        await conn.textList(m.chat, `${head} \n\nSilahkan Pilih Metode Pembayaran Kamu!`, false, [
            [`${usedPrefix}pembayaran ${code}|${number}|${item.price}|${item.product_name}|qris`, "1", "QRIS"],
            [`${usedPrefix}pembayaran ${code}|${number}|${item.price}|${item.product_name}|deposit`, "2", "Deposit"]
        ], m)

    } else {
        if (!code) return m.reply(`Masukan Kode Produk \n\nContoh: \n${usedPrefix + command} ML5`)
        let item = await getProduk(code)
        if (!item) return m.reply("Kode Produk Tersebut Tidak Ditemukan!")
        if (!(item.buyer_product_status && item.seller_product_status)) return m.reply("Status item ini Tidak Ready!")
        if (parseInt(item.price) > (await cekSaldo()).data.deposit) return m.reply("System sedang mengalami gangguan, silahkan coba beberapa saat lagi atau hubungi owner!")
        let footer = `${/MOBILE LEGEND/i.test(item.brand) ? "Contoh ID : 12345678 (2314)" : ""}

Silahkan Balas/Reply pesan ini dengan ID/Nomor kamu!
_*Note :* Pastikan ID/Nomor sesuai sebelum melakukan transaksi._
`.trim()
        await conn.textInput(m.chat, `Kamu akan membeli *${item.product_name}* seharga *Rp ${toRupiah(item.price)}* \n\n${footer}`, false, `${usedPrefix + command} ${code}|INPUT`, m)
    }
}

handler.command = /(order)/i
export default handler

function toRupiah(number) {
    return new Intl.NumberFormat('id-ID').format(number)
}

function toSHA256(str) {
    return crypto.createHash('sha256').update(str).digest('hex')
}