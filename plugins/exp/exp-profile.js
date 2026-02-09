import { checkUser } from "../../lib/checkUser.js"
import fs from "fs"

const handler = async (m, { conn, text, senderKey }) => {
  try {
    await conn.loading(m, conn)

    const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : text ? text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : senderKey

    const quotedKey = await checkUser(conn, who)

    const user = global.db.data.users[quotedKey]
    const userGroup = global.db.data.chats[m.chat].member[quotedKey]

    const normalizeJid = (num) => num.replace(/\D/g, "") + "@s.whatsapp.net"
    const devs = new Set(global.config.owner.filter(([_, __, isDeveloper]) => isDeveloper).map(([num]) => normalizeJid(num)))
    const nonDevs = new Set(global.config.owner.filter(([_, __, isDeveloper]) => !isDeveloper).map(([num]) => normalizeJid(num)))

    const jadibotOwner = new Set(
      Object.values(global.db.data.bots?.jadibot || {})
        .filter((v) => v?.owner)
        .map((v) => normalizeJid(v.owner))
    )

    const isMods = devs.has(quotedKey)
    const isOwner = this?.__isSubBot || m.fromMe || isMods || nonDevs.has(quotedKey) || jadibotOwner.has(quotedKey)

    const userData = global.db.data.users?.[quotedKey]
    const premiumTime = userData?.premiumTime || 0
    const isPrems = isOwner || Date.now() < premiumTime

    if (typeof user == "undefined") return m.reply("Pengguna tidak ada didalam data base")
    const pp = await conn.profilePictureUrl(quotedKey, "image").catch((_) => fs.readFileSync("./src/avatar_contact.png"))
    const bio = await conn.fetchStatus(quotedKey).catch((_) => "Tidak Ada Bio")

    const name = user.registered ? user.name : await conn.getName(quotedKey)
    const caption = `
– User Info

┌ • Username : ${name}
│ • Umur : ${user.registered ? user.age : ""}
│ • Status : ${isMods ? "Developer" : isOwner ? "Owner" : isPrems ? "Premium User" : user.level > 999 ? "Elite User" : "Free User"}
│ • Verified : ${user?.verif ? "✅" : "❌"}
│ • Bio : ${bio.status?.status ? bio.status?.status : "Tidak Ada Bio"} ${m.isGroup ? `\n│ • Masuk Group : ${userGroup?.joined ? `Pada ${dateTime(userGroup?.joined)}` : "Tidak ada"}` : ""}
└ • Hubungan : ${user.pacar != "" ? `Berpacaran dengan ${await conn.tagUser(user.pacar)} sejak ${dateTime(user.pacaranTime)}` : "Tidak ada"}

– RPG Info

┌ • Level : ${toRupiah(user.level)}
│ • Exp : ${toRupiah(user.exp)}
│ • Money : ${toRupiah(user.money)}
└ • Bank : ${toRupiah(user.bank)}

🌟 Premium : ${isPrems ? "✅" : "❌"}
📑 Registered : ${user.registered ? "✅ ( " + dateTime(user.regTime) + " )" : "❌"}
`.trim()

    await conn.sendFile(m.chat, pp, "profile.jpeg", caption, m)
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["profile"]
handler.tags = ["xp"]
handler.command = /^(profile|profil)$/i
export default handler

function dateTime(timestamp) {
  const dateReg = new Date(timestamp)
  const options = { year: "numeric", month: "long", day: "numeric" }
  const formattedDate = dateReg.toLocaleDateString("id-ID", options)
  return formattedDate
}

const toRupiah = (number) => parseInt(number).toLocaleString().replace(/,/g, ".")
