import { GoogleGenAI } from "@google/genai"
import fs from "fs"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_APIKEY })

const handler = async (m, { conn, usedPrefix, command, text, senderKey }) => {
  try {
    if (!text) return m.reply(`Masukan prompt! \n\nContoh: \n${usedPrefix + command} apakah hari ini bakal cerah?`)

    if (!conn.gemini) conn.gemini = {}

    if (!(senderKey in conn.gemini)) {
      conn.gemini[senderKey] = {
        timeOut: setTimeout(() => {
          delete conn.gemini[senderKey]
        }, 600000),
        history: [],
      }
    } else {
      clearTimeout(conn.gemini[senderKey].timeOut)
    }

    await conn.loading(m, conn)

    const chat = ai.chats.create({
      model: "gemini-2.0-flash",
      history: conn.gemini[senderKey].history,
    })

    const response = await chat.sendMessage({
      message: text,
    })
    conn.gemini[senderKey].history.push({ role: "user", parts: [{ text: text }] })
    conn.gemini[senderKey].history.push({ role: "model", parts: [{ text: response.text }] })
    m.reply(response.text, false, false, { smlcap: false })
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["gemini"]
handler.tags = ["ai"]
handler.command = ["gemini", "bard"]
handler.limit = true
export default handler
