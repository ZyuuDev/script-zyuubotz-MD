import { getLidFromJid } from "../../lib/checkUser.js"

export async function before(m, { conn }) {
  if (!m.sender.endsWith("@s.whatsapp.net")) return
  try {
    let users = global.db.data.users
    let isUser = users[m.sender] || false
    let lid = await getLidFromJid(m.sender, conn)
    if (!lid) return
    if (lid === m.sender) return
    let isLid = users[lid] || false
    if (isLid && isUser) {
      if (users[m.sender].exp > users[lid].exp) {
        users[m.sender] = { ...users[m.sender], lid: lid }
        delete users[lid]
        console.log(`Deleted lid ${lid} as ${m.sender} has more exp`)
      } else {
        users[m.sender] = { ...users[lid], lid: lid }
        delete users[lid]
        console.log(`Migrated lid ${lid} to ${m.sender}`)
      }
    }
  } catch (e) {
    console.error("Error in _handlePrivateChat:", e)
  }
}
