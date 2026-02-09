import { canon } from "../../lib/jadibot.js"

let handler = async (m, { conn, isMods, senderKey }) => {
  const bot = global.db.data.bots
  const store = bot.jadibot || {}

  const rows = []

  for (const num of Object.keys(store)) {
    const data = store[num]
    if (!data) continue

    // Filter: user non-mod hanya melihat bot miliknya
    if (!isMods && data.owner !== senderKey) continue

    const name = await conn.getName(num + "@s.whatsapp.net")
    const owner = await conn.getName(data.owner)
    const aktif = data.aktif ?? false

    const expMs = Number(data.expiredAt || 0)
    const left = expMs ? humanLeft(expMs) : "∞"
    const until = expMs ? fmtDate(expMs) : "∞"

    const up = data.since ? fmtUptime(Date.now() - data.since) : "-"

    rows.push({
      name,
      num: "wa.me/" + num,
      aktif,
      left,
      until,
      up,
      owner,
    })
  }

  if (!rows.length) return m.reply("Tidak ada bot tercatat di database.")

  let txt = `╭─━━━━━━━━━━━━─╮
│ *📋 DAFTAR JADIBOT* │
╰─━━━━━━━━━━━━─╯

Total Bot: *${rows.length}*\n\n`

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    txt += `┌─ 🤖 *Bot #${i + 1}*
│ 👤 Nama: *${r.name}*
│ 📱 Nomor: ${r.num}
│ ${r.aktif ? "✅" : "❌"} Status: ${r.aktif ? "*Aktif*" : "*Nonaktif*"}
│ 👑 Owner: ${r.owner}
│ ⏰ Uptime: ${r.up}
│ ⏳ Sisa Waktu: ${r.left}
│ 📅 Expired: ${r.until}
└─────────────────\n\n`
  }

  txt += `_Total: ${rows.length} bot terdaftar_`

  m.reply(txt)
}
handler.help = ["listjadibot"]
handler.tags = ["jadibot"]
handler.command = /^(listjadibot|listbot|listjadibotaktif|listbotaktif|jadibotlist)$/i

export default handler

function fmtUptime(ms) {
  const s = Math.max(1, Math.floor(ms / 1000))
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sc = s % 60

  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m ${sc}s`
  if (m > 0) return `${m}m ${sc}s`
  return `${sc}s`
}

function humanLeft(ts) {
  const left = ts - Date.now()
  if (left <= 0) return "expired"

  const s = Math.floor(left / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)

  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return "< 1m"
}

function fmtDate(ts) {
  try {
    const d = new Date(Number(ts))
    if (isNaN(d.getTime())) return String(ts)

    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  } catch (e) {
    return String(ts)
  }
}
