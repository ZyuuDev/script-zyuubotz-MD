import moment from 'moment-timezone'
import fs from 'fs'

let handler = async (m, { senderKey, conn, usedPrefix, command, text }) => {
    let [hari, deposit] = text.split("|")
    let user = global.db.data.users[senderKey]
    let name = user.registered ? user.name : conn.getName(senderKey)
    if (hari && deposit) {
        hari = Number(hari)
        let harga = Number(deposit)
        let refID = generateRefID()

        if (user.deposit < harga) return m.reply(`Saldo Deposit kamu tidak mencukupi untuk membeli ini! \nSilahkan deposit dahulu menggunakan command *${usedPrefix}deposit*`)
        let caption = await getCaption("Sukses", refID, `Premium ${hari} Hari`, harga, "")
        let image = await imageTransaksi("Sukses")
        await conn.adReply(m.chat, caption, `Halo ${name}, ${wish()}`, global.config.watermark, image, global.config.website, m)
        let jumlahHari = 86400000 * hari
        let now = Date.now()
        user.premiumTime = now < user.premiumTime ? user.premiumTime + jumlahHari : now + jumlahHari
        user.premium = true
        let timers = user.premiumTime - now
        await conn.reply(global.config.owner[0][0] + "@s.whatsapp.net", `
✔️ Success
📛 *Name:* ${name}
📆 *Days:* ${hari} days
📉 *Countdown:* ${msToTime(timers)}
`.trim())
        user.deposit -= harga
        user.historyTrx.push({ status: true, trxId: refID, nominal: harga, type: `Premium ${hari} Hari`, time: Date.now() })
    } else if (hari && !deposit ){
        hari = hari.match(/\d+/g).join('')
        if (!/15|30|45|60/i.test(hari)) return m.reply(`Kamu ingin premium berapa hari? \n\nContoh: \n${usedPrefix + command} 15`)
        let harga = calculateValue(hari)
        let head = `Nomor : ${senderKey.split("@")[0]}`
        await conn.textList(m.chat, `${head} \n\nSilahkan Pilih Metode Pembayaran Kamu!`, false, [
            [`${usedPrefix}pembayaran prem${hari}|${senderKey.split("@")[0]}|${harga}|Premium ${hari} Hari|qris`, "1", "QRIS"],
            [`${usedPrefix + command} ${hari}|${harga}`, "2", "Deposit"]
        ], m)
    } else {
        let caption = `
❏ *_Harga Premium_*
❃ _15 Hari / 5k_
❃ _30 Hari / 10k_
❃ _45 Hari / 15k_
❃ _60 Hari / 20k_

❏ *_Fitur_*
❃ _Unlimited Limit_
❃ _Nsfw_
❃ _Bebas Pakai Bot Di Pc_
❃ _No Limit Command_
❃ _Dan Lain Lain_

Minat? Silahkan Chat Nomor Owner Dibawah 
${global.config.owner.map(([jid, name]) => {
    return `
Name : ${name}
wa.me/${jid}
`.trim()
}).join('\n\n')
}

Atau Ketik 
${usedPrefix + command} 15d
`.trim()
        await conn.adReply(m.chat, caption, `Halo ${name}, ${wish()}`, global.config.watermark, fs.readFileSync("./media/thumbnail.jpg"), global.config.website, m)
    }
}
handler.help = ["premium"]
handler.tags = ["main"]
handler.command = /^(premium)$/i
export default handler

function generateRefID() {
    return 'ry-' + Math.random().toString(36).substr(2, 9)
}

function getCaption(status, refID, produk, harga, sn) {
    let desc = {
        "Pending": "",
        "Sukses": "_Silahkan Cek Akun Anda, Jika Belum Masuk Hubungi Owner._",
        "Gagal": "_Mohon Maaf, Saldo Anda Sudah Di-Convert Menjadi Saldo Deposit, Silahkan Ulangi Transaksi Atau Hubungi Owner._"
    }
    let caption = `
*TRANSAKSI ${status.toUpperCase()}!*

RefID : ${refID} ${sn ? `
SN : ${sn}` : ""}
Pembelian : ${produk}
Harga : Rp ${toRupiah(harga)} ${status == "Gagal" ? `
Saldo : + Rp ${toRupiah(harga)}` : ""}
Status : ${status}
Waktu : ${formattedDate(Date.now())}

_Pembelian ${produk} ${status}!_ ${desc[status]}
`.trim()
    return caption
}

function imageTransaksi(status) {
    let image = {
        "Pending": "pembayaran_diproses.png",
        "Sukses": "pembayaran_berhasil.png",
        "Gagal": "pembayaran_gagal.png"
    }
    return fs.readFileSync(`./media/${image[status]}`)
}

function msToTime(ms) {
    let seconds = parseInt((ms / 1000) % 60)
    let minutes = parseInt((ms / (1000 * 60)) % 60)
    let hours = parseInt((ms / (1000 * 60 * 60)) % 24)
    let days = parseInt(ms / (1000 * 60 * 60 * 24))

    return `${days}d ${hours}h ${minutes}m ${seconds}s`
}

function wish() {
    let wishloc = ''
    let time = moment.tz('Asia/Jakarta').format('HH')
    wishloc = ('Hi')
    if (time >= 0) {
        wishloc = ('Selamat Malam')
    }
    if (time >= 4) {
        wishloc = ('Selamat Pagi')
    }
    if (time >= 11) {
        wishloc = ('Selamat Siang')
    }
    if (time >= 15) {
        wishloc = ('️Selamat Sore')
    }
    if (time >= 18) {
        wishloc = ('Selamat Malam')
    }
    if (time >= 23) {
        wishloc = ('Selamat Malam')
    }
    return wishloc
}

function calculateValue(days) {
    const valuePer15Days = 5000
    const valuePerDay = valuePer15Days / 15
    const totalValue = days * valuePerDay
    return parseInt(totalValue)
}

function toRupiah(number) {
    return new Intl.NumberFormat('id-ID').format(number)
}

function formattedDate(ms) {
    return moment(ms).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm')
}