import { getProduk } from "../../lib/digiflazz.js"

let handler = async (m, { senderKey, conn, usedPrefix, command, text }) => {
    if (!text) return m.reply(`Masukan Kode Produk \n\nContoh: \n${usedPrefix + command} ML5`)
    let item = await getProduk(text)
    if (!item) return m.reply("Kode Produk Tersebut Tidak Ditemukan!")
    let caption = `
Produk : *${item.product_name}*
Category : *${item.category}*
Status : *${item.buyer_product_status && item.seller_product_status ? "Ready" : "Tidak Ready"}*
Stock : *${item.unlimited_stock ? "Unlimited" : toRupiah(item.stock)}*
Harga : *Rp ${toRupiah(item.price)}*
Cut Off Time : *${item.start_cut_off} - ${item.end_cut_off}*

Deskripsi : ${item.desc}
`.trim()
    let button = /Voucher/i.test(item.category) ? [[`${usedPrefix}pembayaran ${text}|${senderKey.split("@")[0]}|${item.price}|${item.product_name}`, "Order"]] : [[`${usedPrefix}order ${text}`, "Order"]]
    await conn.textOptions(m.chat, caption, false, button, m)
}
handler.command = /(cekproduk)/i
export default handler

function toRupiah(number) {
    return new Intl.NumberFormat('id-ID').format(number)
}