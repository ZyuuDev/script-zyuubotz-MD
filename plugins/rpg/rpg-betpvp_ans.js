export async function before(m, { conn, senderKey }) {
  conn.judipvp = conn.judipvp ? conn.judipvp : {}
  let room = Object.values(conn.judipvp).find((room) => room.id.startsWith("judipvp") && room.status && [room.p, room.p2].includes(senderKey))
  let user = global.db.data.users
  if (m.fromMe) return
  let score = Math.ceil(Math.random() * 100) * 1
  let score2 = Math.ceil(Math.random() * 100) * 1
  if (room) {
    if (senderKey == room.p2 && /y(a|es)?|n(o)?|tidak/i.test(m.text.toLowerCase()) && m.isGroup && room.status == "wait") {
      if (/n(o)?|tidak/i.test(m.text.toLowerCase())) {
        conn.reply(m.chat, `@${room.p2.split`@`[0]} menolak judipvp, judipvp dibatalkan`, m, { contextInfo: { mentionedJid: [room.p2] } })
        delete conn.judipvp[room.id]
      }
      if (user[room.p2][room.type] < room.taruhan) return m.reply(`Uang Kamu Kurang! Kamu membutuhkan ${room.taruhan} ${room.type}`)
      if (user[room.p][room.type] < room.taruhan) return m.reply(`Uang Lawanmu Kurang! membutuhkan ${room.taruhan} ${room.type}`)
      clearTimeout(room.waktu)
      room.status = "spin"
      room.asal = m.chat
      room.spin = room.p
      await conn.reply(room.asal, `Silahkan Spin @${room.p.split("@")[0]}\n\nSpin dengan cara ketik *Spin/Judi*`, m, { contextInfo: { mentionedJid: [room.p] } })
      room.waktu = setTimeout(() => {
        conn.reply(m.chat, `Waktu habis @${room.spin.split("@")[0]} Tidak menjawab`, m, { contextInfo: { mentionedJid: [room.spin] } })
        delete conn.judipvp[room.id]
      }, 60000)
    } else if (room.status == "spin" && /spin|judi/i.test(m.text)) {
      if (senderKey !== room.spin) return m.reply("Sekarang bukan giliran kamu")
      if (user[room.spin][room.type] < room.taruhan) return m.reply(`Uang Kamu Kurang! Kamu membutuhkan ${room.taruhan} ${room.type}`)
      if (user[room.p2][room.type] < room.taruhan) return m.reply(`Uang Lawanmu Kurang! membutuhkan ${room.taruhan} ${room.type}`)
      clearTimeout(room.waktu)
      room.score = score
      room.status = "spinp"
      room.spin = room.p2
      room.waktu = setTimeout(() => {
        conn.reply(m.chat, `Waktu habis @${room.spin.split("@")[0]} Tidak menjawab`, m, { contextInfo: { mentionedJid: [room.spin] } })
        delete conn.judipvp[room.id]
      }, 60000)
      conn.reply(room.asal, `@${senderKey.split("@")[0]} Berhasil mendapatkan score ${score}\nSekarang giliran @${room.p2.split("@")[0]} untuk spin\n\nSilahkan ketik *Spin/Judi* Untuk spin`, m, { contextInfo: { mentionedJid: [room.p, room.p2] } })
    } else if (room.status == "spinp" && /spin|judi/i.test(m.text)) {
      if (senderKey !== room.spin) return m.reply(room.asal, "Sekarang bukan giliranmu!", m)
      if (user[room.spin][room.type] < room.taruhan) return m.reply(`Uang Kamu Kurang! Kamu membutuhkan ${room.taruhan} ${room.type}`)
      if (user[room.p][room.type] < room.taruhan) return m.reply(`Uang Lawanmu Kurang! membutuhkan ${room.taruhan} ${room.type}`)
      clearTimeout(room.waktu)
      if (room.score < score2) {
        user[room.p2][room.type] += room.taruhan * 1
        user[room.p][room.type] -= room.taruhan * 1
        room.win = room.p2
      } else if (room.score > score2) {
        user[room.p2][room.type] -= room.taruhan * 1
        user[room.p][room.type] += room.taruhan * 1
        room.win = room.p
      } else {
        room.win = "draw"
      }
      conn.reply(
        room.asal,
        `
| *PLAYERS* | *POINT* |
*👤 @${room.p.split("@")[0]} :*      ${room.score}
*👤 @${room.p2.split("@")[0]} :*    ${score2}

${room.win !== "draw" ? `Pemenangnya adalah @${room.win.split("@")[0]} Dan mendapatkan *${toRupiah(room.taruhan * 1)} ${capitalize(room.type)}* ${global.rpg.emoticon(room.type)}` : `Draw Masing Masing Mendapatkan *${toRupiah(room.taruhan)} ${capitalize(room.type)}* ${global.rpg.emoticon(room.type)}`}
`.trim(),
        m,
        { contextInfo: { mentionedJid: [room.p, room.p2] } }
      )
      delete conn.judipvp[room.id]
    }
    return !0
  }
  return !0
}

const delay = (time) => new Promise((res) => setTimeout(res, time))

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.substr(1)
}

const toRupiah = (number) => parseInt(number).toLocaleString().replace(/,/g, ".")
