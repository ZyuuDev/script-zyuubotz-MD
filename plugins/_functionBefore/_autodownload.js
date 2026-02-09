import axios from "axios"

export async function before(m, { senderKey, conn }) {
  if (!/lid|@s.whatsapp.net/.test(senderKey)) return
  if (!conn.ai) conn.ai = {}
  let user = global.db.data.users[senderKey]
  let chat = global.db.data.chats[m.chat]

  if (!m.isGroup || !m.text || chat.mute || chat.isBanned || user.banned || m.fromMe) return
  if (m.text.startsWith("=>") || m.text.startsWith(">") || m.text.startsWith(".") || m.text.startsWith("#") || m.text.startsWith("!") || m.text.startsWith("/") || m.text.startsWith("/")) return
  if (/elaina/gi.test(m.text) || (senderKey in conn.ai && m.quoted && m.quoted.text === conn.ai[senderKey].chat.text)) return

  let text = m.text.replace(/\n+/g, " ")
  const ephemeral = conn.chats[m.chat]?.metadata?.ephemeralDuration || conn.chats[m.chat]?.ephemeralDuration || false
  if ((chat.autodownload || user.autodownload) && text.match(regex)) {
    conn.autodownload = conn.autodownload || {}
    let link = text.match(regex)[0]

    if (/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?/i.test(link)) {
      const response = await axios.get(global.API("ryhar", "/api/downloader/youtube-video", { url: link }, "apikey"))
      const { result } = response.data
      if (result.success) return
      const buffer = await conn.getFile(result.link)
      const fileSize = buffer.data.length
      if (!(senderKey in conn.autodownload)) {
        try {
          conn.autodownload[senderKey] = true
          conn.readAndComposing(m)
          await conn.loading(m, this)

          if (fileSize / 1024 / 1024 > 50) {
            await conn.sendMessage(m.chat, { document: buffer.data, fileName: result.title, mimetype: buffer.mime }, { quoted: m, ephemeralExpiration: ephemeral })
          } else {
            await conn.sendFile(m.chat, buffer.data, result.title, "", m, false, { mimetype: buffer.mime })
          }
        } catch (e) {
          return !0
        } finally {
          await conn.loading(m, this, true)
          delete conn.autodownload[senderKey]
        }
      }
    }

    if (/^http(s)?:\/\/(www|v(t|m)).tiktok.com\/[-a-zA-Z0-9@:%._+~#=]/i.test(link)) {
      if (!(senderKey in conn.autodownload)) {
        try {
          conn.autodownload[senderKey] = true
          conn.readAndComposing(m)
          await conn.loading(m, this)
          let { data } = await tiktok(link)
          if (data.images) {
            await conn.sendFile(m.chat, data.images[0], false, link, m)
          } else {
            await conn.sendFile(m.chat, data.play, false, link, m)
          }
        } catch (e) {
          return !0
        } finally {
          await conn.loading(m, this, true)
          delete conn.autodownload[senderKey]
        }
      }
    }

    if (/^http(s)?:\/\/(www)?.instagram.com\/(p|reel|v)\/[-a-zA-Z0-9@:%._+~#=]|https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._%+-]+(\/[A-Za-z0-9._%+-]+)*(\/\?[A-Za-z0-9=&._%+-]*)?/i.test(link)) {
      if (!(senderKey in conn.autodownload)) {
        try {
          conn.autodownload[senderKey] = true
          conn.readAndComposing(m)
          await conn.loading(m, this)
          let media = await axios.get(global.API("ryhar", "/api/downloader/instagram", { url: link }, "apikey"))
          await conn.sendFile(m.chat, media.data.result.link[0], false, link, m)
        } catch {
          return !0
        } finally {
          await conn.loading(m, this, true)
          delete conn.autodownload[senderKey]
        }
      }
    }

    if (/^https?:\/\/(?:www\.)?facebook\.com/i.test(link)) {
      if (!(senderKey in conn.autodownload)) {
        try {
          conn.autodownload[senderKey] = true
          conn.readAndComposing(m)
          await conn.loading(m, this)
          let media = await axios.get(global.API("ryhar", "/api/downloader/facebook", { url: args[0] }, "apikey"))
          await conn.sendFile(m.chat, media.data.result[0].link, false, link, m)
        } catch {
          return !0
        } finally {
          await conn.loading(m, this, true)
          delete conn.autodownload[senderKey]
        }
      }
    }
  }
  return !0
}

async function tiktok(url) {
  let res = await axios.post(
    "https://www.tikwm.com/api",
    {},
    {
      params: {
        url,
        hd: 1,
      },
    }
  )
  return res.data
}

const regex = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi
const delay = (time) => new Promise((res) => setTimeout(res, time))
