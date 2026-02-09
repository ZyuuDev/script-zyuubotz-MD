import moment from "moment-timezone"

let handler = async (m, { conn, text: textInput, usedPrefix, command }) => {
  try {
    const [caption, chatTime, statusBarTime] = textInput.split("|").map((v) => v.trim())

    const time = moment.tz("Asia/Jakarta").format("HH:mm")

    const _chatTime = chatTime || time
    const _statusBarTime = statusBarTime || time

    if (!caption) return m.reply(`Masukan text! \n\nContoh: \n${usedPrefix + command} Halo|${_chatTime}|${_statusBarTime}`)

    await conn.loading(m, conn)

    const result = global.API("ryhar", "/maker/fakechat-iphone", { text: caption, chatTime: _chatTime, statusBarTime: _statusBarTime }, "apikey")

    await conn.sendFile(m.chat, result, null, "Ini Dia Kak", m)
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["iqc"]
handler.tags = ["maker"]
handler.command = /^(iqc)$/i
handler.limit = true
export default handler
