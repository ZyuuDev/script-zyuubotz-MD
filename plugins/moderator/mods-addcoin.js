let handler = async (m, { conn, text, usedPrefix, command }) => {
  const [coinName, baseHarga, symbol] = text.split("|").map((v) => v.trim())
  if (!coinName) return m.reply(`Masukkan nama coin! \n\nContoh: \n${usedPrefix + command} Bitcoin|1000|symbol`)
  if (!baseHarga) return m.reply(`Masukkan harga coin! \n\nContoh: \n${usedPrefix + command} Bitcoin|1000|symbol`)
  if (!symbol) return m.reply(`Masukkan symbol coin! \n\nContoh: \n${usedPrefix + command} Bitcoin|1000|symbol`)
  const harga = Number(baseHarga.replace(/[^0-9]/g, ""))
  if (!harga) return m.reply(`Harga coin tidak valid!`)
  if (isNaN(harga)) return m.reply(`Harga coin harus berupa angka!`)
  if (harga <= 0) return m.reply(`Harga coin tidak boleh kurang dari atau sama dengan 0!`)
  const listCoin = Object.keys(global.db.data.bots.invest.item)
  if (listCoin.includes(coinName)) return m.reply(`Coin *${coinName}* sudah ada!`)
  global.db.data.bots.invest.item[coinName] = {
    name: capitalize(coinName),
    hargaBefore: harga,
    harga: harga,
    stock: 10000,
    rise: ["naik", "stay", "stay", "stay", "stay", "turun"],
    volumeBuy: 0,
    volumeSell: 0,
    trade: [],
    marketcap: 0,
    high: 0,
    low: 0,
    chartNow: 0,
    chart: {},
    open: 0,
    suspend: false,
    symbol: symbol,
  }
  m.reply(`Berhasil menambahkan coin *${coinName}*`)
}
handler.help = ["addcoin"]
handler.tags = ["mods"]
handler.command = /^(addcoin)$/i
handler.mods = true
export default handler

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}
