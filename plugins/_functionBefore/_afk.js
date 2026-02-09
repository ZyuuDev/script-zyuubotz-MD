import { checkUser } from "../../lib/checkUser.js"

export async function before(m, { senderKey, conn }) {
  if (m.fromMe || !m.isGroup) return
  if (!/lid|@s.whatsapp.net/.test(senderKey)) return
  if (!m.text && !/sticker|image/i.test(m.mediaType)) return
  let user = global.db.data.users[senderKey]

  if (user.afk > -1) {
    conn.readAndComposing(m)
    await m.reply(
      `
${await conn.tagUser(senderKey)} berhenti AFK${user.afkReason ? " setelah " + user.afkReason : ""}
Selama ${(new Date() - user.afk).toTimeString()}
`.trim(),
      false,
      { mentions: [senderKey] }
    )
    user.afk = -1
    user.afkReason = ""
  }
  let quotedKey = null
  if (m.quoted) {
    quotedKey = await checkUser(m, m.quoted.sender)
  }
  let jids = [...new Set([...(m.mentionedJid || []), ...(quotedKey ? [quotedKey] : [])])]
  for (let jid of jids) {
    let users = global.db.data.users[jid]
    if (!users) continue
    if (!users.afk || users.afk < 0) continue
    conn.readAndComposing(m)
    await m.reply(
      `
Jangan tag dia!
Dia sedang AFK ${users.afkReason ? "dengan alasan " + users.afkReason : "tanpa alasan"}
Selama ${(new Date() - users.afk).toTimeString()}
`.trim()
    )
  }
  return !0
}
