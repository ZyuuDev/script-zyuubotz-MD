import { stopChild, canon, digit, getChildByNumber } from "../../lib/jadibot.js"

let handler = async (m, { conn, text, usedPrefix, command, senderKey, isMods }) => {
  let num = canon(text || "")

  const bot = global.db.data.bots

  const jadibot = bot.jadibot

  if (!num) {
    const keys = Object.keys(jadibot).filter((v) => {
      return isMods || jadibot[v].owner === senderKey
    })

    if (keys.length === 0) {
      return conn.reply(m.chat, `❌ Tidak ada sesi jadibot yang ${isMods ? "terdaftar" : "kamu miliki"}.\n\n_Gunakan:_\n*${usedPrefix}jadibot 62xxxxxxxxxx*`, m)
    }

    if (keys.length > 1) {
      const list = await Promise.all(
        keys.map(async (v, i) => {
          const name = await conn.getName(v + "@s.whatsapp.net")
          const status = jadibot[v].aktif ? "✅ Aktif" : "❌ Tidak Aktif"
          const expired = jadibot[v].expiredAt ? new Date(jadibot[v].expiredAt).toLocaleString("id-ID") : "∞"

          const child = getChildByNumber(v)
          const connStatus = child?.user?.id ? " (🔗 Connected)" : ""

          return [`${usedPrefix}${command} ${v}`, (i + 1).toString(), `${name}\n📞 ${v}\n${status}${connStatus}\n📅 Expired: ${expired}`]
        })
      )
      return await conn.textList(m.chat, `Pilih jadibot yang ingin dimatikan:`, false, list, m)
    } else if (keys.length === 1) {
      num = keys[0]
    }
  }

  if (!num) {
    return conn.reply(m.chat, `❌ Nomor tidak valid.\n\nContoh:\n*${usedPrefix}${command} 62xxxxxxxxxx*`, m)
  }

  if (!jadibot[num]) {
    return conn.reply(m.chat, `❌ Sesi ${num} tidak ditemukan di database.\n\n_Tidak ada yang perlu dimatikan_`, m)
  }

  if (!isMods && jadibot[num].owner !== senderKey) {
    return conn.reply(m.chat, `❌ Kamu bukan owner dari jadibot ${num}`, m)
  }

  const child = getChildByNumber(num)

  if (!child) {
    if (jadibot[num].aktif) {
      jadibot[num].aktif = false
      jadibot[num].lastStoppedAt = Date.now()

      return conn.reply(m.chat, `⚠️ Bot ${num} tidak sedang berjalan, namun telah diupdate di database sebagai tidak aktif.\n\n_Status: ❌ Tidak Aktif_`, m)
    } else {
      return conn.reply(m.chat, `ℹ️ Bot ${num} sudah tidak aktif.\n\n_Tidak ada yang perlu dimatikan_`, m)
    }
  }

  await conn.reply(m.chat, `⏳ Mematikan jadibot ${num}...`, m)

  try {
    await stopChild(num, "stopped")

    if (jadibot[num]) {
      jadibot[num].aktif = false
      jadibot[num].lastStoppedAt = Date.now()
      jadibot[num].lastStoppedBy = senderKey
    }

    const expText = jadibot[num]?.expiredAt ? new Date(jadibot[num].expiredAt).toLocaleString("id-ID") : "∞"

    await conn.reply(
      m.chat,
      `✅ *Berhasil Mematikan Jadibot*

📱 Nomor: ${num}
🤖 Bot ID: ${child.user?.id || "-"}
📅 Masa aktif hingga: ${expText}

_Bot telah dimatikan. Untuk mengaktifkan kembali gunakan:_
*${usedPrefix}reconnect ${num}*`,
      m
    )
  } catch (e) {
    console.error("Error stopping bot:", e)

    if (jadibot[num]) {
      jadibot[num].aktif = false
      jadibot[num].lastStoppedAt = Date.now()
    }

    await conn.reply(m.chat, `⚠️ Terjadi error saat mematikan jadibot ${num}:\n\n${e?.message || e}\n\n_Status di database telah diupdate sebagai tidak aktif_`, m)
  }
}

handler.help = ["stopbot [nomor]"]
handler.tags = ["jadibot"]
handler.command = /^(stopbot|stopjadibot|matikanbot)$/i
handler.botUtama = true

export default handler
