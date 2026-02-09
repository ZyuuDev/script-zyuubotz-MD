import { checkUser } from "../../lib/checkUser.js"

let handler = async (m, { senderKey, conn, args, usedPrefix, command }) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : args[0] ? args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net" : false

  const quotedKey = await checkUser(conn, who)

  let user = global.db.data.users[quotedKey]
  if (!quotedKey) return m.reply("Masukan Nomor Atau Tag Orangnya!")
  let txt = args[1]
  if (!txt) return m.reply("Masukan Jumlah Hari Yang Ingin Diberikan")
  if (isNaN(txt)) return m.reply(`Hanya Angka!\n\nContoh :\n${usedPrefix + command} @${senderKey.split`@`[0]} 7`)
  let jumlahHari = 86400000 * txt
  let now = new Date() * 1
  if (now < user.premiumTime) user.premiumTime += jumlahHari
  else user.premiumTime = now + jumlahHari
  user.premium = true
  let timers = user.premiumTime - now
  await conn.reply(
    quotedKey,
    `✔️ Success! Kamu Sekarang User Premium!
📛 *Name:* ${user.name}
📆 *Days:* ${txt} days
📉 *Countdown:* ️ ${timers.toTimeString()}`,
    false
  )
  await delay(2000)
  await m.reply(`✔️ Success
📛 *Name:* ${user.name}
📆 *Days:* ${txt} days
📉 *Countdown:* ️ ${timers.toTimeString()}`)
}
handler.help = ["addprem"]
handler.tags = ["mods"]
handler.command = /^(add(prem|premium))$/i
handler.mods = true
export default handler

const delay = (time) => new Promise((res) => setTimeout(res, time))
