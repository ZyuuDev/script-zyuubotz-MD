import { jadwalSholat } from '../../lib/scrape.js'

let handler = async (m, { text }) => {
	if (!text) throw 'Masukan nama kotanya' 
	let res = await jadwalSholat(text)
	res = res.data.map(({ lokasi, daerah, jadwal }) => {
		delete jadwal.tanggal, delete jadwal.date
		jadwal = Object.keys(jadwal).map((v) => `• ${v.capitalize()}: ${jadwal[v]}`).join('\n')
		return `*Lokasi:* ${lokasi}\n*Daerah:* ${daerah}\n*Jadwal:*\n${jadwal}`
	}).join`\n\n`
	m.reply(res)
}
handler.help = ['jadwalsholat']
handler.tags = ['tools']
handler.command = /^(jadwalsholat)$/i

export default handler