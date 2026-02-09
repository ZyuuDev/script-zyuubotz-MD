import { checkUser } from "../../lib/checkUser.js"

let timeout = 60000
let poin = 500
let poin_lose = -100
let handler = async (m, { conn, usedPrefix, senderKey }) => {
  conn.suit = conn.suit ? conn.suit : {}
  if (Object.values(conn.suit).find((room) => room.id.startsWith("suit") && [room.p, room.p2].includes(senderKey))) return m.reply("Selesaikan suit mu yang sebelumnya")
  if (Object.values(conn.suit).find((room) => room.id.startsWith("suit") && [room.p, room.p2].includes(m.mentionedJid[0]))) return m.reply(`Orang yang kamu tantang sedang bermain suit bersama orang lain :(`)
  let musuh = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
  if (!musuh) return m.reply(`_Siapa yang ingin kamu tantang?_\nTag orangnya.. Contoh\n\n${usedPrefix}suit @${senderKey.replace(/@.+/, "")}`, m.chat, { contextInfo: { mentionedJid: [senderKey] } })
  const quotedKey = await checkUser(conn, musuh)
  let id = "suit_" + new Date() * 1
  let caption = `
_*SUIT PvP*_

${await conn.tagUser(senderKey)} menantang ${await conn.tagUser(quotedKey)} untuk bermain suit

Silahkan ${await conn.tagUser(quotedKey)} 
`.trim()
  let footer = `\n\nKetik "terima/ok/gas" untuk memulai suit\nKetik "tolak/gabisa/nanti" untuk menolak`
  conn.suit[id] = {
    chat: await conn.reply(m.chat, caption + footer, m, { mentions: conn.parseMention(caption) }),
    id: id,
    p: senderKey,
    p2: quotedKey,
    status: "wait",
    waktu: setTimeout(() => {
      if (conn.suit[id]) conn.reply(m.chat, `_Waktu suit habis_`, m)
      delete conn.suit[id]
    }, timeout),
    poin,
    poin_lose,
    timeout,
  }
}
handler.help = ["suitpvp"]
handler.tags = ["fun"]
handler.command = /^suitpvp$/i
handler.group = true
export default handler
