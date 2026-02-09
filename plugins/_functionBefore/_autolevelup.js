import { canLevelUp, xpRange } from "../../lib/levelling.js"
import canvafy from "canvafy"
import fs from "fs"
export async function before(m, { conn, senderKey }) {
  if (!/lid|@s.whatsapp.net/.test(senderKey)) return
  let user = global.db.data.users
  let chat = global.db.data.chats[m.chat]
  if (m.fromMe || !m.isGroup || chat?.mute || chat?.isBanned || user?.[senderKey]?.banned) return
  if (m.text.startsWith("=>") || m.text.startsWith(">") || m.text.startsWith(".") || m.text.startsWith("#") || m.text.startsWith("!") || m.text.startsWith("/") || m.text.startsWith("/")) return
  if (chat.autolevelup || user[senderKey]?.autolevelup) {
    if (canLevelUp(user[senderKey]?.level || 0, user[senderKey]?.exp || 0, 38)) {
      await conn.readAndComposing(m)

      let before = user[senderKey].level * 1
      while (canLevelUp(user[senderKey].level, user[senderKey].exp, 38)) user[senderKey].level++
      if (before !== user[senderKey].level) {
        let str = `
*🎉 C O N G R A T S 🎉*
*${before}* ➔ *${user[senderKey].level}* [ *${user[senderKey].role}* ]

*Note:* _Semakin sering berinteraksi dengan bot Semakin Tinggi level kamu_
`.trim()
        let member = Object.keys(user)
          .filter((v) => user[v].level > 0)
          .sort((a, b) => {
            const totalA = user[a].level
            const totalB = user[b].level
            return totalB - totalA
          })
        let { min, xp, max } = xpRange(user[senderKey].level, 38)
        const pp = await conn.profilePictureUrl(senderKey, "image").catch((_) => fs.readFileSync("./src/avatar_contact.png"))
        const name = user[senderKey].registered ? user[senderKey].name : conn.getName(senderKey)
        try {
          let img = await canvafyRank(pp, name, "online", user[senderKey].level, member.indexOf(senderKey), user[senderKey].exp - min, xp)
          await conn.sendFile(m.chat, img, "levelup.jpg", str, m)
        } catch (e) {
          let img = await canvafyRank(pp, name, "online", user[senderKey].level, member.indexOf(senderKey), user[senderKey].exp - min, xp)
          await conn.sendFile(m.chat, img, "levelup.jpg", str, m)
        }
      }
    }
    return !0
  }
  return !0
}

async function canvafyRank(avatar, username, status, level, rank, cxp, rxp) {
  const background = ["https://pomf2.lain.la/f/tjkwx2ro.jpg", "https://pomf2.lain.la/f/unw8fo6l.jpg", "https://pomf2.lain.la/f/kw2o7unm.jpg", "https://pomf2.lain.la/f/2kjrz5ho.jpg", "https://pomf2.lain.la/f/g3d4id5i.jpg"]
  const rankBuffer = await new canvafy.Rank().setAvatar(avatar).setBackground("image", background.getRandom()).setUsername(username).setBorder("#FF00F1").setBarColor("#FF00F1").setStatus("online").setLevel(level).setRank(rank).setCurrentXp(cxp).setRequiredXp(rxp).build()
  return rankBuffer
}
