import { jadwalSholat } from "../../lib/scrape.js"

let handler = async (m, { conn, usedPrefix, command, text }) => {
  let chat = global.db.data.chats[m.chat]
  switch (command) {
    case "setnotifadzan": {
      if (!chat.notifAdzan) return m.reply(`Silahkan hidupkan dulu notif adzan dengan command *${usedPrefix}enable notifadzan*`)
      if (!text) return m.reply(`Masukan Nama Kota! \n\nContoh: \n${usedPrefix + command} palembang`)
      const res = await jadwalSholat(text)
      if (res.data.length < 1) return m.reply("Kota Tidak Ditemukan")
      const list = res.data.map((v, i) => {
        return [`${usedPrefix}setnotifadzan-kota ${v.lokasi}`, (i + 1).toString(), `${v.lokasi}`]
      })
      await conn.textList(m.chat, `Silahkan Pilih Kota Yang Kamu Inginkan.`, false, list, m)
      break
    }
    case "setnotifadzan-kota": {
      if (!chat.notifAdzan) return m.reply(`Silahkan hidupkan dulu notif adzan dengan command *${usedPrefix}enable notifadzan*`)
      if (!text) return m.reply(`Masukan Nama Kota! \n\nContoh: \n${usedPrefix + command} palembang`)
      chat.notifSholat.kota = text
      chat.notifSholat.tanggal = ""
      m.reply(`Berhasil Mengubah Kota Adzan menjadi ${text}`)
      break
    }
  }
}
handler.help = ["setnotifadzan"]
handler.tags = ["group"]
handler.command = /^(setnotifadzan(-kota)?)$/i
handler.group = true
handler.admin = true
export default handler
