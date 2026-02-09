let handler = async (m, { senderKey, conn, usedPrefix }) => {
    let { botol, kardus, kaleng, gelas, plastik } = global.db.data.users[senderKey]

	let caption = `
乂 Isi Karung Mu

❃ _Botol_ = ${toRupiah(botol)}
❃ _Kardus_ = ${toRupiah(kardus)}
❃ _Kaleng_ = ${toRupiah(kaleng)}
❃ _Gelas_ = ${toRupiah(gelas)}
❃ _Plastik_ = ${toRupiah(plastik)}
 `.trim()
    m.reply(caption)
}

handler.help = ['karung']
handler.tags = ['rpg']
handler.command = /^(karung)$/i
handler.register = true
handler.group = true
handler.rpg = true
export default handler

const toRupiah = number => parseInt(number).toLocaleString().replace(/,/gi, ".")