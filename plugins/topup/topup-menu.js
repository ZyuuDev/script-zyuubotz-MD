import { listHarga } from "../../lib/digiflazz.js"

let digiUser = process.env.DIGIFLAZZ_USERNAME
let digiApi = process.env.DIGIFLAZZ_APIKEY

let handler = async (m, { senderKey, conn, usedPrefix, command, text }) => {
    let user = global.db.data.users[senderKey]
    let name = user.registered ? user.name : m.name
    if (!digiUser || !digiApi) return m.reply("Silahkan isi apikey dan username di config.js terlebih dahulu!")
    let produk = await listHarga()
    let item = filterType(produk, "category")
    let caption = `
*INFO USER*
Nama : *${name}*
Rank : *${user.rank}*
Saldo : *Rp ${toRupiah(user.deposit)}*

_Silahkan Pilih Produk Dibawah Ini, Tersedia Berbagai Macam Kebutuhan Dan Yang Pasti Murah!_
`.trim()
    let list = item.map((v, i) => {
        return [`${usedPrefix}listHarga ${v.category}`, (i + 1).toString(), v.category]
    })
    await conn.textList(m.chat, caption, false, list, m)
}
handler.help = ["topup"]
handler.tags = ["topup"]
handler.command = /(topup(menu)?)/i
export default handler

function toRupiah(number) {
    return new Intl.NumberFormat('id-ID').format(number)
}

const filterType = (data, idKey) => {
    const seen = new Set()
    return data.filter(item => {
        if (item[idKey]) {
            if (seen.has(item[idKey])) {
                return false
            }
            seen.add(item[idKey])
        }
        return true
    })
}