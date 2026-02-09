let handler = async (m, { conn, usedPrefix, args, senderKey }) => {
  conn.akinator = conn.akinator ? conn.akinator : {}
  if (!(senderKey in conn.akinator)) return m.reply("Kamu belum ada di sesi akinator!")
  if (!args[0]) return m.reply("Masukan Jawaban Kamu!")
  if (!/0|1|2|3|4/i.test(args[0])) return m.reply("Invalid Number")

  clearTimeout(conn.akinator[senderKey].waktu)
  await conn.akinator[senderKey].answer(args[0])

  const aki = conn.akinator[senderKey]

  if (aki.isWin) {
    let cap = `🎮 *Akinator Answer*\n\n`
    cap += `Dia Adalah *${aki.sugestion_name}* Dari *${aki.sugestion_desc}*`
    conn.sendFile(m.chat, aki.sugestion_photo, "", cap, m)
    delete conn.akinator[senderKey]
  } else {
    let txt = `🎮 *Akinator* 🎮\n\n`
    txt += `_step ${aki.currentStep} ( ${aki.progress.toFixed(2)} % )_\n\n${aki.question}\n\n`
    txt += "🎮 _*Silahkan Jawab Dengan Cara:*_\n"
    txt += `_*Ya* - ${usedPrefix}answer 0_\n`
    txt += `_*Tidak* - ${usedPrefix}answer 1_\n`
    txt += `_*Saya Tidak Tahu* - ${usedPrefix}answer 2_\n`
    txt += `_*Mungkin* - ${usedPrefix}answer 3_\n`
    txt += `_*Mungkin Tidak* - ${usedPrefix}answer 4_`

    aki.currentStep += 1

    conn.akinator[senderKey].chat = await conn.reply(m.chat, txt, m, { mentions: [senderKey] })
    conn.akinator[senderKey].waktu = setTimeout(() => {
      conn.reply(m.chat, `Waktu Memilih Akinator Habis`, conn.akinator[senderKey].chat)
      delete conn.akinator[senderKey]
    }, 5 * 60000)
  }
}
handler.command = /^(answer)$/i
handler.limit = true
handler.onlyprem = true
handler.game = true
export default handler
