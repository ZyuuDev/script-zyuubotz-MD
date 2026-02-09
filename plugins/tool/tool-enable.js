import moment from "moment-timezone"
import fs from "fs"
let handler = async (m, { senderKey, conn, usedPrefix, command, args, isOwner, isAdmin, isMods, isPrems }) => {
  let isEnable = /true|enable|(turn)?on|1/i.test(command)
  let chat = global.db.data.chats[m.chat]
  let user = global.db.data.users[senderKey]
  let bot = global.db.data.settings[conn.user.jid] || {}
  if (!isOwner && m.chat.endsWith("@s.whatsapp.net")) return global.dfail("group", m, conn)
  let name = user.registered ? user.name : conn.getName(senderKey)
  let type = (args[0] || "").toLowerCase()
  let isAll = false,
    isUser = false
  let caption = `
${
  !isOwner || m.chat.endsWith("@g.us")
    ? `
*ADMIN COMMAND :*
• adminonly ${chat.adminOnly ? "*( ON )*" : "*( OFF )*"}
• antilink ${chat.antiLinks ? "*( ON )*" : "*( OFF )*"}
• antitagsw ${chat.antiTagSW ? "*( ON )*" : "*( OFF )*"}
• antivn ${chat.antiVn ? "*( ON )*" : "*( OFF )*"}
• antilinkgc ${chat.antiLinkGc ? "*( ON )*" : "*( OFF )*"}
• antilinkwa ${chat.antiLinkWa ? "*( ON )*" : "*( OFF )*"}
• antitoxic ${chat.antiToxic ? "*( ON )*" : "*( OFF )*"}
• antibadword ${chat.antiBadword ? "*( ON )*" : "*( OFF )*"}
• antidelete ${chat.antidelete ? "*( ON )*" : "*( OFF )*"}
• antisticker ${chat.antiSticker ? "*( ON )*" : "*( OFF )*"}
• antiimage ${chat.antiImage ? "*( ON )*" : "*( OFF )*"}
• anticustomtext ${chat.antiCustomText ? "*( ON )*" : "*( OFF )*"}
• restrict ${chat.pembatasan ? "*( ON )*" : "*( OFF )*"}
• game ${chat.game ? "*( ON )*" : "*( OFF )*"}
• rpg ${chat.rpg ? "*( ON )*" : "*( OFF )*"}
• nsfw ${chat.nsfw ? "*( ON )*" : "*( OFF )*"}
• welcome ${chat.welcome ? "*( ON )*" : "*( OFF )*"}
• autolevelup ${chat.autolevelup ? "*( ON )*" : "*( OFF )*"}
• autodownload ${chat.autodownload ? "*( ON )*" : "*( OFF )*"}
• notifgempa ${chat.notifgempa ? "*( ON )*" : "*( OFF )*"}
• notifadzan ${chat.notifAdzan ? "*( ON )*" : "*( OFF )*"}

`
    : ""
} ${
    isOwner
      ? `
*OWNER COMMAND :*
• autobackup ${bot.backup ? "*( ON )*" : "*( OFF )*"}
• autoread ${bot.autoread ? "*( ON )*" : "*( OFF )*"}
• composing ${bot.composing ? "*( ON )*" : "*( OFF )*"}
• swonly ${opts.swonly ? "*( ON )*" : "*( OFF )*"}
• anticall ${bot.anticall ? "*( ON )*" : "*( OFF )*"}
• noprint ${opts.noprint ? "*( ON )*" : "*( OFF )*"}
• adreply ${bot.adReply ? "*( ON )*" : "*( OFF )*"}
• noerror ${bot.noerror ? "*( ON )*" : "*( OFF )*"}
• allrpg ${bot.rpg ? "*( ON )*" : "*( OFF )*"}
• allnsfw ${bot.nsfw ? "*( ON )*" : "*( OFF )*"}
• allgame ${bot.game ? "*( ON )*" : "*( OFF )*"}
• loading ${bot.loading ? "*( ON )*" : "*( OFF )*"}
• textloading ${bot.loadingText ? "*( ON )*" : "*( OFF )*"}
• button ${bot.isButton ? "*( ON )*" : "*( OFF )*"}
• smlcap ${bot.smlcap ? "*( ON )*" : "*( OFF )*"}
`
      : ""
  }
––––––––––––––––––––––––

💁🏻‍♂ Tip :
➠ Type Command :
${usedPrefix + command} [options]
• Contoh :
${usedPrefix + command} adminonly
`.trim()
  switch (type) {
    case "welcome":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.welcome = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "notifadzan":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.notifAdzan = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "antibot":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.antiBot = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "otakunews":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.otakuNews = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "komikunews":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.komikuNews = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "antiimage":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.antiImage = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "notifgempa":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.notifgempa = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "adminonly":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.adminOnly = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "antitagsw":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.antiTagSW = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "anticustomtext":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.antiCustomText = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "autodownload":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.autodownload = isEnable
      } else {
        if (!isPrems) {
          global.dfail("premium", m, conn)
          return
        }
        user.autodownload = isEnable
      }
      break
    case "autolevelup":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.autolevelup = isEnable
      } else {
        if (!isPrems) {
          global.dfail("premium", m, conn)
          return
        }
        user.autolevelup = isEnable
      }
      break
    case "detect":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.detect = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "antiviewonce":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.viewonce = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "antivn":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.antiVn = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "antidelete":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.antidelete = !isEnable
      } else return global.dfail("group", m, conn)
      break
    case "text":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.teks = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "antilink":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.antiLinks = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "antilinkgc":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.antiLinkGc = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "antilinkwa":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.antiLinkWa = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "nsfw":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.nsfw = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "rpg":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.rpg = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "antivirtex":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.antiVirtex = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "composing":
      isAll = true
      if (!isMods) {
        global.dfail("mods", m, conn)
        return
      }
      bot.composing = isEnable
      break
    case "smlcap":
      isAll = true
      if (!isMods) {
        global.dfail("mods", m, conn)
        return
      }
      bot.smlcap = isEnable
      break
    case "adreply":
      isAll = true
      if (!isOwner) {
        global.dfail("owner", m, conn)
        return
      }
      bot.adReply = isEnable
      break
    case "loading":
      isAll = true
      if (!isOwner) {
        global.dfail("owner", m, conn)
        return
      }
      bot.loading = isEnable
      break
    case "textloading":
      isAll = true
      if (!isOwner) {
        global.dfail("owner", m, conn)
        return
      }
      bot.loadingText = isEnable
      break
    case "allnsfw":
      isAll = true
      if (!isOwner) {
        global.dfail("owner", m, conn)
        return
      }
      bot.nsfw = isEnable
      break
    case "button":
      isAll = true
      if (!isOwner) {
        global.dfail("owner", m, conn)
        return
      }
      bot.isButton = isEnable
      break
    case "allrpg":
      isAll = true
      if (!isOwner) {
        global.dfail("owner", m, conn)
        return
      }
      bot.rpg = isEnable
      break
    case "allgame":
      isAll = true
      if (!isOwner) {
        global.dfail("owner", m, conn)
        return
      }
      bot.game = isEnable
      break
    case "noerror":
      isAll = true
      if (!isOwner) {
        global.dfail("owner", m, conn)
        return
      }
      bot.noerror = isEnable
      break
    case "antisticker":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
      } else return global.dfail("group", m, conn)
      chat.antiSticker = isEnable
      break
    case "antibadword":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.antiBadword = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "antitoxic":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.antiToxic = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "restrict":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.pembatasan = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "game":
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
        chat.game = isEnable
      } else return global.dfail("group", m, conn)
      break
    case "anticall":
      isAll = true
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail("admin", m, conn)
          return
        }
      }
      bot.anticall = isEnable
      break
    case "whitelistmycontacts":
      isAll = true
      if (!isOwner) {
        global.dfail("owner", m, conn)
        return
      }
      conn.callWhitelistMode = isEnable
      break
    case "autobackup":
      isAll = true
      if (!isOwner) {
        global.dfail("owner", m, conn)
        return
      }
      bot.backup = isEnable
      break
    case "autocleartmp":
      isAll = true
      if (!isOwner) {
        global.dfail("owner", m, conn)
        return
      }
      bot.cleartmp = isEnable
      break
    case "autorestock":
      isAll = true
      if (!isOwner) {
        global.dfail("owner", m, conn)
        return
      }
      bot.autoRestock = isEnable
      break
    case "autoread":
      isAll = true
      if (!isMods) {
        global.dfail("mods", m, conn)
        return
      }
      bot.autoread = isEnable
      break
    case "noprint":
      isAll = true
      if (!isMods) {
        global.dfail("mods", m, conn)
        return
      }
      global.opts["noprint"] = isEnable
      break
    case "pconly":
      isAll = true
      if (!isMods) {
        global.dfail("mods", m, conn)
        return
      }
      global.opts["pconly"] = isEnable
      break
    case "gconly":
      isAll = true
      if (!isMods) {
        global.dfail("mods", m, conn)
        return
      }
      global.opts["gconly"] = isEnable
      break
    case "swonly":
      isAll = true
      if (!isMods) {
        global.dfail("mods", m, conn)
        return
      }
      global.opts["swonly"] = isEnable
      break
    default:
      return conn.adReply(m.chat, caption, wish() + " " + name, "Setiap command memiliki fungsi masing masing", fs.readFileSync("./media/thumbnail.jpg"), global.config.website, m)
  }
  await m.reply(`${type} berhasil ${isEnable ? "dinyalakan" : "dimatikan"} untuk ${isAll ? "bot ini" : "chat ini"} !`)
}
handler.help = ["enable", "disable"]
handler.tags = ["tools"]
handler.command = /^((en|dis)able|setting|settings|(tru|fals)e|(turn)?o(n|ff)|[01])$/i

export default handler

function wish() {
  let wishloc = ""
  const time = moment.tz("Asia/Jakarta").format("HH")
  wishloc = "Hi"
  if (time >= 0) {
    wishloc = "Selamat Malam"
  }
  if (time >= 4) {
    wishloc = "Selamat Pagi"
  }
  if (time >= 11) {
    wishloc = "Selamat Siang"
  }
  if (time >= 15) {
    wishloc = "️Selamat Sore"
  }
  if (time >= 18) {
    wishloc = "Selamat Malam"
  }
  if (time >= 23) {
    wishloc = "Selamat Malam"
  }
  return wishloc
}
