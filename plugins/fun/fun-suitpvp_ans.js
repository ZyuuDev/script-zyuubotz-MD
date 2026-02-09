let handler = (m) => m
handler.before = async function (m, { conn, senderKey }) {
  if (!conn.suit) conn.suit = {}
  if (!senderKey.endsWith("s.whatsapp.net") || m.fromMe) return
  let user = global.db.data.users
  if (user[senderKey].suit < 0) user[senderKey].suit = 0
  let room = Object.values(conn.suit).find((room) => room.id && room.status && [room.p, room.p2].includes(senderKey))
  if (room) {
    let win = ""
    let tie = false
    if (senderKey == room.p2 && /^(acc(ept)?|terima|gas|oke?|tolak|gamau|nanti|ga(k.)?bisa)/i.test(m.text) && m.isGroup && room.status == "wait") {
      if (/^(tolak|gamau|nanti|ga(k.)?bisa)/i.test(m.text)) {
        conn.reply(m.chat, `${await conn.tagUser(room.p2)} menolak suit, suit dibatalkan`, m, {
          contextInfo: {
            mentionedJid: [room.p2],
          },
        }),
          delete conn.suit[room.id]
        return !0
      }
      room.status = "play"
      room.asal = m.chat
      clearTimeout(room.waktu)
      conn.reply(
        m.chat,
        `Suit telah dikirimkan ke chat
${await conn.tagUser(room.p)} dan
${await conn.tagUser(room.p2)}

Silahkan pilih suit di chat masing"
klik wa.me/${conn.user.jid.split`@`[0]}`,
        m,
        { mentions: [room.p, room.p2] }
      )

      if (room.status == "play") {
        await conn.reply(room.p, `Silahkan pilih *batu/gunting/kertas*\n\nMenang +${room.poin}XP\nKalah -${room.poin_lose}XP`, null)
        delay(1500)
        await conn.reply(room.p2, `Silahkan pilih *batu/gunting/kertas*\n\nMenang +${room.poin}XP\nKalah -${room.poin_lose}XP`, null)
      }
      room.waktu_milih = setTimeout(async () => {
        if (!room.pilih && !room.pilih2) return conn.reply(m.chat, `Kedua pemain tidak niat main,\nSuit dibatalkan`, m)
        else if (!room.pilih || !room.pilih2) {
          win = !room.pilih ? room.p2 : room.p
          conn.reply(m.chat, `${await conn.tagUser(room.pilih ? room.p2 : room.p)} tidak memilih suit, game berakhir`, m, {
            mentions: [room.pilih ? room.p2 : room.p],
          })
          user[win == room.p ? room.p : room.p2].exp += room.poin
          user[win == room.p ? room.p2 : room.p].exp -= room.poin_lose
        }
        delete conn.suit[room.id]
        return !0
      }, room.timeout)
    }
    let jwb = senderKey == room.p
    let jwb2 = senderKey == room.p2
    let g = /gunting/i
    let b = /batu/i
    let k = /kertas/i
    let reg = /^(gunting|batu|kertas)/i
    if (jwb && reg.test(m.text) && !room.pilih && !m.isGroup) {
      room.pilih = reg.exec(m.text.toLowerCase())[0]
      room.text = m.text
      m.reply(`Kamu telah memilih ${m.text} ${!room.pilih2 ? `\n\nMenunggu lawan memilih` : ""}`)
      if (!room.pilih2) conn.reply(room.p2, "_Lawan sudah memilih_\nSekarang giliran kamu", null)
    }
    if (jwb2 && reg.test(m.text) && !room.pilih2 && !m.isGroup) {
      room.pilih2 = reg.exec(m.text.toLowerCase())[0]
      room.text2 = m.text
      m.reply(`Kamu telah memilih ${m.text} ${!room.pilih ? `\n\nMenunggu lawan memilih` : ""}`)
      if (!room.pilih) conn.reply(room.p, "_Lawan sudah memilih_\nSekarang giliran kamu", null)
    }
    let stage = room.pilih
    let stage2 = room.pilih2
    if (room.pilih && room.pilih2) {
      clearTimeout(room.waktu_milih)
      if (b.test(stage) && g.test(stage2)) win = room.p
      else if (b.test(stage) && k.test(stage2)) win = room.p2
      else if (g.test(stage) && k.test(stage2)) win = room.p
      else if (g.test(stage) && b.test(stage2)) win = room.p2
      else if (k.test(stage) && b.test(stage2)) win = room.p
      else if (k.test(stage) && g.test(stage2)) win = room.p2
      else if (stage == stage2) tie = true
      conn.reply(
        room.asal,
        `
                _*Hasil Suit*_${tie ? "\nSERI" : ""}

                ${await conn.tagUser(room.p)} (${room.text}) ${tie ? "" : room.p == win ? ` Menang \n+${room.poin}XP` : ` Kalah \n-${room.poin_lose}XP`}
                ${await conn.tagUser(room.p2)} (${room.text2}) ${tie ? "" : room.p2 == win ? ` Menang \n+${room.poin}XP` : ` Kalah \n-${room.poin_lose}XP`}
                `.trim(),
        null,
        {
          mentions: [room.p, room.p2],
        }
      )
      if (!tie) {
        user[win == room.p ? room.p : room.p2].exp += room.poin
        user[win == room.p ? room.p2 : room.p].exp += room.poin_lose
      }
      delete conn.suit[room.id]
    }
  }
  return !0
}
handler.exp = 0
export default handler

let delay = (time) => new Promise((res) => setTimeout(res, time))

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
