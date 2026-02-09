let handler = async (m, { conn, usedPrefix, command, args }) => {
  if (!args[0]) return m.reply(`Masukan nama item!\n\nContoh :\n${usedPrefix + command} diamond`)
  let stock = global.db.data.bots.stock
  if (!Object.keys(stock).includes(args[0])) return m.reply(`Item *${args[0]}* tidak ditemukan!`)
  let total = Math.floor(isNumber(args[1]) ? Math.min(Math.max(parseInt(args[1]), 1), Number.MAX_SAFE_INTEGER) : 1) * 1
  stock[args[0]] += total
  m.reply(`Berhasil menambah stock *${args[0]}* sebanyak *${total}*`)
}
handler.help = ["restock"]
handler.tags = ["mods"]
handler.command = /^(restock)$/i
handler.mods = true
export default handler

function isNumber(number) {
  if (!number) return number
  number = parseInt(number)
  return typeof number == "number" && !isNaN(number)
}
