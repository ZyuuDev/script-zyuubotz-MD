export async function before(m, { conn }) {
  if (m.isGroup) {
    const groupMetadata = (conn.chats[m.chat] || {}).metadata || (await conn.groupMetadata(m.chat).catch(() => null))
    if (!groupMetadata || groupMetadata.addressingMode !== "lid") return

    const user = global.db.data.users
    try {
      for (const participant of groupMetadata.participants) {
        if (!participant.phoneNumber || !participant.id) continue
        const jid = conn.decodeJid(participant.phoneNumber)
        const lid = conn.decodeJid(participant.id)

        if (!user[jid] && user[lid]) {
          user[jid] = { ...user[lid], lid: lid }
          delete user[lid]
          console.log(`Migrated lid ${lid} to ${jid}`)
        } else if (user[jid] && user[lid]) {
          if (typeof user[lid].exp === "number" && typeof user[jid].exp === "number") {
            if (user[lid].exp > user[jid].exp) {
              user[jid] = { ...user[lid], lid: lid }
              delete user[lid]
              console.log(`Replaced jid ${jid} with lid ${lid} (higher exp)`)
            } else {
              // Jika exp sama atau lebih kecil, hapus lid tanpa mengubah jid
              user[jid] = { ...user[jid], lid: lid }
              delete user[lid]
              console.log(`Kept jid ${jid}, deleted lid ${lid}`)
            }
          } else {
            // Jika exp tidak vaid, hapus lid untuk bersihkan
            delete user[lid]
            console.log(`Deleted lid ${lid} due to invaid exp`)
          }
        }
      }
    } catch (error) {
      console.error("Error in user migration:", error)
    }
  }
}
