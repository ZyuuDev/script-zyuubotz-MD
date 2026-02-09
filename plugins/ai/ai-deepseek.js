import OpenAI from "openai"
const openai = new OpenAI({
  apiKey: process.env.NVIDIA_APIKEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
})
let handler = async (m, { conn, usedPrefix, command, text, senderKey }) => {
  try {
    if (!conn.deepseek) conn.deepseek = {}
    if (!text) return m.reply(`Masukan text! \n\nContoh : \n${usedPrefix + command} siapa kamu`)
    await conn.loading(m, conn)
    if (!(senderKey in conn.deepseek)) {
      conn.deepseek[senderKey] = {
        timeOut: setTimeout(() => {
          delete conn.deepseek[senderKey]
        }, 600000),
        messages: [],
      }
    } else {
      clearTimeout(conn.deepseek[senderKey].timeOut)
    }
    let deepseek = conn.deepseek[senderKey]

    const completion = await openai.chat.completions.create({
      model: "deepseek-ai/deepseek-r1",
      messages: [
        ...deepseek.messages,
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 1024,
      stream: true,
    })
    let response = ""
    for await (const chunk of completion) {
      response += chunk.choices[0]?.delta?.content || ""
    }
    await m.reply(response, false, false, { smlcap: false })
    deepseek.messages.push(
      {
        role: "user",
        content: text,
      },
      {
        role: "assistant",
        content: response,
      }
    )
    deepseek.timeOut = setTimeout(() => {
      delete conn.deepseek[senderKey]
    }, 600000)
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["deepseek"]
handler.tags = ["internet"]
handler.command = /^(deepseek)$/i
handler.limit = true
handler.onlyprem = true
export default handler
