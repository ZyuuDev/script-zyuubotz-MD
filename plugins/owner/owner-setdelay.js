let handler = async (m, { conn, args, usedPrefix, command }) => {
  const setting = global.db.data.settings[conn.user.jid] || {}
  if (!args[0] || isNaN(args[0])) return m.reply(`Delay command bot saat ini adalah ${setting.delay / 1000} detik\nMasukkan angka mewakili jumlah detik !\n\nContoh : \n${usedPrefix + command} 30`)
  const delay = 1000 * args[0]
  setting.delay = delay
  m.reply(`Berhasil menetapkan delay command bot selama ${args[0]} detik`)
}
handler.help = ["setdelaycmd"]
handler.tags = ["owner"]
handler.command = /^(set(delay|tunggu)|add(delay|tunggu)cmd)$/i
handler.owner = true
export default handler
