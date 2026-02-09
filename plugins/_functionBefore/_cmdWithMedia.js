import { generateWAMessage, proto } from "@whiskeysockets/baileys"
import { checkUser } from "../../lib/checkUser.js"
export async function before(m, chatUpdate) {
  try {
    const senderKey = await checkUser(this, m.sender)
    if (m.fromMe) return
    const user = global.db.data.users[senderKey]

    if (!user) return

    const devs = global.config.owner.filter(([_, __, isDeveloper]) => isDeveloper).map(([num]) => num.replace(/\D/g, "") + "@s.whatsapp.net")
    const nonDevs = global.config.owner.filter(([_, __, isDeveloper]) => !isDeveloper).map(([num]) => num.replace(/\D/g, "") + "@s.whatsapp.net")
    const jadibotOwner = Object.values(global.db.data.bots.jadibot).map((v) => v.owner.replace(/[^0-9]/g, "") + "@s.whatsapp.net")

    const isMods = devs.includes(senderKey)
    const isOwner = this?.__isSubBot || m.fromMe || isMods || nonDevs.includes(senderKey) || jadibotOwner.includes(senderKey)

    const isPrems = isOwner || Date.now() < (global.db.data.users[senderKey] || { premiumTime: 0 }).premiumTime

    if (m.fromMe || !m.message || !isPrems || !m.msg.fileSha256) return

    global.db.data.users[senderKey].sticker = global.db.data.users[senderKey].sticker || {}

    const fileHash = Buffer.from(m.msg.fileSha256).toString("base64")
    const userStickerData = global.db.data.users[senderKey].sticker

    if (!(fileHash in userStickerData)) return

    let hash = userStickerData[fileHash]
    let { text, mentionedJid } = hash

    let messages = await generateWAMessage(
      m.chat,
      { text, mentions: mentionedJid },
      {
        userJid: this.user.id,
        quoted: m.quoted && m.quoted.fakeObj,
      }
    )

    messages.key.fromMe = false
    messages.key.id = m.key.id
    messages.pushName = m.pushName

    if (m.isGroup) messages.participant = senderKey

    let msg = {
      ...chatUpdate,
      messages: [proto.WebMessageInfo.fromObject(messages)],
      type: "append",
    }

    this.ev.emit("messages.upsert", msg)
  } catch (error) {
    console.error("Error processing message:", error)
  }
}
