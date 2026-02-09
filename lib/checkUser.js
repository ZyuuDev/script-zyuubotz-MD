async function getLidFromJid(id, conn) {
  if (id.endsWith("@lid")) return id
  const res = await conn.onWhatsApp(id).catch(() => [])
  return res[0]?.lid || id
}

export { getLidFromJid }

export async function checkUser(conn, sender) {
  if (!sender || typeof sender !== "string") {
    return sender
  }

  if (!sender.endsWith("@s.whatsapp.net") && !sender.endsWith("@lid")) {
    return sender
  }

  const users = global.db.data.users
  const messageType = sender.endsWith("@lid") ? "lid" : "s.whatsapp.net"

  if (messageType === "s.whatsapp.net") {
    const user = users[sender] || false
    if (user && !user.lid) {
      const lid = await getLidFromJid(sender, conn)
      if (!user?.lid) user.lid = lid
    }
    return sender
  }

  if (messageType === "lid") {
    const user = users[sender] || false
    if (!user) {
      const userLid = Object.keys(users).find((key) => users[key].lid === sender)
      if (userLid) return userLid
    }
    return sender
  }

  console.error("Unknown message type:", messageType)
  return sender
}
