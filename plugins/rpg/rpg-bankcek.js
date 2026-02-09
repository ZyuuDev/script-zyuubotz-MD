import { checkUser } from "../../lib/checkUser.js"

let handler = async (m, { senderKey, conn }) => {
  const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : senderKey

  const quotedKey = await checkUser(conn, who)

  const user = global.db.data.users[quotedKey]
  if (typeof user === "undefined") return m.reply(`User ${quotedKey} not in database`)

  const devs = global.config.owner.filter(([_, __, isDeveloper]) => isDeveloper).map(([num]) => num.replace(/\D/g, "") + "@s.whatsapp.net")
  const nonDevs = global.config.owner.filter(([_, __, isDeveloper]) => !isDeveloper).map(([num]) => num.replace(/\D/g, "") + "@s.whatsapp.net")
  const jadibotOwner = Object.values(global.db.data.bots.jadibot).map((v) => v.owner.replace(/[^0-9]/g, "") + "@s.whatsapp.net")

  const isMods = devs.includes(quotedKey)
  const isOwner = this?.__isSubBot || m.fromMe || isMods || nonDevs.includes(quotedKey) || jadibotOwner.includes(quotedKey)

  const isPrems = isOwner || Date.now() < (global.db.data.users[quotedKey] || { premiumTime: 0 }).premiumTime

  const caption = `
▧「 *BANK INFO* 」
│ Name: ${user.registered ? user.name : conn.getName(quotedKey)}
│ Status: ${isMods ? "Developer" : isOwner ? "Owner" : isPrems ? "Premium User" : user.level > 999 ? "Elite User" : "Free User"}
│ Registered: ${user.registered ? "Yes" : "No"}
│ 
│ Atm: ${user.atm > 0 ? "Level " + toRupiah(user.atm) : "✖️"}
│ Bank: ${toRupiah(user.bank)} / ${toRupiah(user.fullatm)}
│ Money: ${toRupiah(user.money)}
│ Chip: ${toRupiah(user.chip)}
│ Robo: ${user.robo > 0 ? "Level " + user.robo : "✖️"}
└────···
`.trim()
  await conn.adReply(m.chat, caption, "B A N K  I N F O", "", flaImg.getRandom() + "BANK INFO", global.config.website, m)
}
handler.help = ["bank"]
handler.tags = ["rpg"]
handler.command = /^(bank)$/i
handler.register = true
handler.group = true
handler.rpg = true
export default handler

const flaImg = [
  "https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=water-logo&script=water-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextColor=%23000&shadowGlowColor=%23000&backgroundColor=%23000&text=",
  "https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=crafts-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&text=",
  "https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=amped-logo&doScale=true&scaleWidth=800&scaleHeight=500&text=",
  "https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&text=",
  "https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&fillColor1Color=%23f2aa4c&fillColor2Color=%23f2aa4c&fillColor3Color=%23f2aa4c&fillColor4Color=%23f2aa4c&fillColor5Color=%23f2aa4c&fillColor6Color=%23f2aa4c&fillColor7Color=%23f2aa4c&fillColor8Color=%23f2aa4c&fillColor9Color=%23f2aa4c&fillColor10Color=%23f2aa4c&fillOutlineColor=%23f2aa4c&fillOutline2Color=%23f2aa4c&backgroundColor=%23101820&text=",
]

const toRupiah = (number) => parseInt(number).toLocaleString().replace(/,/gi, ".")
