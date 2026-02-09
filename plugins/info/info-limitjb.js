import { checkUser } from "../../lib/checkUser.js"

let handler = async (m, { conn, senderKey }) => {
  let who = m.isGroup ? m.mentionedJid[0] || senderKey : senderKey
  const quotedKey = await checkUser(conn, who)
  if (!quotedKey) return m.reply("Gagal mendeteksi pengguna.")

  const user = global.db.data.users[quotedKey]
  if (!user) return m.reply("Pengguna tidak ada di dalam database.")

  const devs = global.config.owner.filter(([_, __, isDeveloper]) => isDeveloper).map(([num]) => num.replace(/\D/g, "") + "@s.whatsapp.net")
  const nonDevs = global.config.owner.filter(([_, __, isDeveloper]) => !isDeveloper).map(([num]) => num.replace(/\D/g, "") + "@s.whatsapp.net")
  const jadibotOwner = Object.values(global.db.data.bots.jadibot).map((v) => v.owner.replace(/[^0-9]/g, "") + "@s.whatsapp.net")

  const isMods = devs.includes(quotedKey)
  const isOwner = this?.__isSubBot || m.fromMe || isMods || nonDevs.includes(quotedKey) || jadibotOwner.includes(quotedKey)

  const isPrems = isOwner || Date.now() < (global.db.data.users[quotedKey] || { premiumTime: 0 }).premiumTime

  const jbEntries = Object.entries(global.db.data?.bots?.jadibot || {})

  const activeBots = await Promise.all(
    jbEntries
      .filter(([_, val]) => val.owner === quotedKey)
      .map(async ([keyBy, val]) => {
        let tag = keyBy
        try {
          tag = await conn.tagUser(keyBy)
        } catch {}
        const uptime = val.lastConnected ? fmtUptime(Date.now() - val.lastConnected) : val.connectedAt ? fmtUptime(Date.now() - val.connectedAt) : "-"
        return `*${tag}*\nUptime : ${uptime}\nLink : wa.me/${keyBy.split("@")[0]}`
      })
  )

  m.reply(
    `👤 *${user.registered ? user.name : await conn.getName(quotedKey)}*
▧ Status : ${isMods ? "Developer" : isOwner ? "Owner" : isPrems ? "Premium" : user.level > 999 ? "Elite User" : "Free User"}
▧ Limit JB : ${user.limitjb} JB

🤖 *Bot aktif:*
${activeBots.join("\n\n") || "Tidak ada bot aktif"}`
  )
}

handler.help = ["limitjb"]
handler.tags = ["info"]
handler.command = /^(limit(jb|jadibot))$/i
export default handler

function fmtUptime(ms) {
  const s = Math.max(1, (ms / 1000) | 0)
  const h = (s / 3600) | 0
  const m = ((s % 3600) / 60) | 0
  const sc = s % 60
  return `${h}h ${m}m ${sc}s`
}
