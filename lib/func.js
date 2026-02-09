import fetch from "node-fetch"
import fs from "fs"

export async function fetchData(url, headers, method = "GET") {
  try {
    const response = await fetch(url, {
      method: method,
      headers: headers,
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error(error)
  }
}

export async function getAdReply(conn, title, body, thumbnail, mediaUrl, sourceUrl, isLarge = false) {
  const hwaifu = JSON.parse(fs.readFileSync("./json/hwaifu.json", "utf-8"))
  return {
    contextInfo: {
      externalAdReply: {
        showAdAttribution: isLarge,
        containsAutoReply: true,
        mediaType: 1,
        title: title,
        body: body,
        thumbnail: (await conn.getFile(thumbnail)).data,
        renderLargerThumbnail: true,
        mediaUrl: mediaUrl || hwaifu[Math.floor(Math.random() * hwaifu.length)],
        sourceUrl: sourceUrl,
      },
    },
  }
}

export const ephemeral = (conn, m) => {
  const duration = conn?.chats?.[m?.chat]?.metadata?.ephemeralDuration || conn?.chats?.[m?.chat]?.ephemeralDuration

  return duration || false
}

export const groups = (conn) => {
  const groupChats = []

  if (!conn?.chats) return groupChats

  for (const [jid, chat] of Object.entries(conn.chats)) {
    if (!chat) continue

    const isCommunity = chat.metadata?.isCommunity ?? chat.isCommunity ?? false
    const isCommunityAnnounce = chat.metadata?.isCommunityAnnounce ?? chat.isCommunityAnnounce ?? false

    if (jid.endsWith("@g.us") && chat.isChats && !isCommunity && !isCommunityAnnounce) {
      groupChats.push(jid)
    }
  }

  return groupChats
}
