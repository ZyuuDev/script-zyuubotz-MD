import { Instrument } from "../../lib/scrape.js"

let handler = async (m, { conn, usedPrefix, command, senderKey }) => {
  try {
    conn.instrument = conn.instrument || {}
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''
    if (senderKey in conn.instrument) return m.reply("Audio kamu masih di proses!")
    if (!/audio|opus/.test(mime)) return m.reply(`Balas vn/audio yang ingin diubah dengan caption *${usedPrefix + command}*`)
    await conn.loading(m, conn)
    conn.instrument[senderKey] = "process"
    const audio = await q.download()
    const { vocal, instrument } = await Instrument(audio)
    await conn.sendFile(m.chat, vocal, '', '', m, false, { mimetype: "audio/mpeg" })
    await conn.sendFile(m.chat, instrument, '', '', m, false, { mimetype: "audio/mpeg"})
  } finally {
    await conn.loading(m, conn, true)
    delete conn.instrument[senderKey]
  }
}
handler.help = ["instrument"]
handler.tags = ["ai"]
handler.command = /^(instrument(al)?)$/i
export default handler