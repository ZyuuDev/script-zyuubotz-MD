import { jadwalSholat } from "../../lib/scrape.js"

export async function before(m, { conn, senderKey }) {
  if (!/lid|@s.whatsapp.net/.test(senderKey)) return
  const groups = Object.entries(conn.chats)
    .filter(([jid, chat]) => jid.endsWith("@g.us") && chat.isChats && !chat.metadata?.read_only && !chat.metadata?.announce && !chat.isCommunity && !chat.isCommunityAnnounce && !chat?.metadata?.isCommunity && !chat?.metadata?.isCommunityAnnounce)
    .map((v) => v[0])

  const d = new Date().toLocaleDateString("id", { timeZone: "Asia/Jakarta" }).split("/").join("-")

  for (let id of groups) {
    let chat = global.db.data.chats[id]
    chat = chat || {}
    let chats = chat.notifSholat
    chats = chats || {}

    // Ensure the 'chats' object has all required properties
    chats.kota = chats.kota || "Jakarta"
    chats.tanggal = chats.tanggal || ""
    chats.jadwalSholat = chats.jadwalSholat || {}
    chats.currentPrayer = chats.currentPrayer || ""

    if (chat.notifAdzan && chats.tanggal !== d) {
      try {
        const res = await jadwalSholat(chats.kota)
        let jadwalsholat = {}
        Object.keys(res.data[0].jadwal)
          .filter((v) => !/tanggal|date|terbit/i.test(v))
          .forEach((v) => {
            jadwalsholat[v] = res.data[0].jadwal[v]
          })

        chats.jadwalSholat = jadwalsholat
        chats.tanggal = d
        chats.tanggal = res.tanggal
      } catch (err) {
        console.error(`Failed to fetch Jadwal Sholat for group ${id}:`, err)
      }
    }
  }
}
