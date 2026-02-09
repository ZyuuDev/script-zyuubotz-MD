import { listHarga } from "../../lib/digiflazz.js"

let handler = async (m, { conn, usedPrefix, command, text }) => {
    let [category, brand, type] = text.split("|")
    if (category && brand && type) {
        let produk = await listHarga(brand)
        let item = produk.filter(v => v.category == category && v.brand == brand && v.type == type)
        item.sort((a, b) => a.price - b.price)
        let list = item.map((v, i) => {
            return [`${usedPrefix}cekproduk ${v.buyer_sku_code}`, (i + 1).toString(), `${v.product_name} \nHarga : Rp ${toRupiah(v.price)} \nStatus : ${v.buyer_product_status && v.seller_product_status ? "Ready" : "Tidak Ready"}`]
        })
        await conn.textList(m.chat, `Silahkan Pilih Jumlah Item Yang Ingin Kamu Beli.`, false, list, m)
    } else if (category && brand && !type) {
        let produk = await listHarga(brand)
        let item = produk.filter(v => v.category == category && v.brand == brand)
        let typeList = Array.from(new Map(item.map(v => [v.type, v])).values())
        let list
        if (typeList.length === 1) {
            item.sort((a, b) => a.price - b.price)
            list = item.map((v, i) => {
                return [`${usedPrefix}cekproduk ${v.buyer_sku_code}`, (i + 1).toString(), `${v.product_name} \nHarga : Rp ${toRupiah(v.price)} \nStatus : ${v.buyer_product_status && v.seller_product_status ? "Ready" : "Tidak Ready"}`]
            })
            return await conn.textList(m.chat, `Silahkan Pilih Jumlah Item Yang Ingin Kamu Beli.`, false, list, m)
        }
        list = typeList.map((v, i) => {
            return [`${usedPrefix + command} ${category}|${brand}|${v.type}`, (i + 1).toString(), v.type]
        })
        await conn.textList(m.chat, `Silahkan Pilih Type Produk Yang Mau Dibeli.`, false, list, m)
    } else if (category && !brand && !type) {
        let produk = await listHarga()
        let item = produk.filter(v => v.category === category)
        let brandList = Array.from(new Map(item.map(v => [v.brand, v])).values())
        let list = brandList.map((v, i) => {
            return [`${usedPrefix + command} ${category}|${v.brand}`, (i + 1).toString(), `${v.brand}`]
        })
        await conn.textList(m.chat, `Silahkan Pilih Jenis Brand Yang Kamu Cari.`, false, list, m)
    }
}
handler.help = ["listharga"]
handler.tags = ["topup"]
handler.command = /^(listharga)/i
export default handler

function toRupiah(number) {
    return new Intl.NumberFormat('id-ID').format(number)
}