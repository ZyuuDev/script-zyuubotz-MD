import moment from 'moment-timezone'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Masukan link channel! \n\nContoh: \n${usedPrefix + command} https://whatsapp.com/channel/...`)
  if (!text.includes('https://whatsapp.com/channel/')) return m.reply(`Link channel salah! \n\nContoh: \n${usedPrefix + command} https://whatsapp.com/channel/...`)

  try {
    const channelCode = text.split('https://whatsapp.com/channel/')[1]
    const res = await conn.newsletterMetadata("invite", channelCode)

    if (!res?.id) return conn.reply(m.chat, 'Gagal mengambil info channel..', m)

    const verified = res.verification === 'VERIFIED' ? 'Ya' : 'Tidak'
    const status = res.state === 'ACTIVE' ? 'Aktif' : 'Tidak aktif'

    const caption = `
Nama : *${res.name}*
ID : *${res.id}*
Dibuat Pada : *${moment(res.createdAt).tz('Asia/Jakarta').format('D MMMM, YYYY [Pukul] HH:mm')}*
Status : *${status}*
Verified : *${verified}*
Total Subscribers : *${res.subscribers.toLocaleString('id-ID')}*

Deskripsi :
_${res.description}_
`.trim()

    await conn.adReply(m.chat, caption, 'S T A L K C H A N N E L', '', res.preview, text, m)
  } catch (err) {
    console.error(err)
    m.reply('Gagal mengambil info channel..')
  }
}

handler.help = ['stalkch']
handler.tags = ['tools']
handler.command = /^stalk(ch|channel)$/i

export default handler
