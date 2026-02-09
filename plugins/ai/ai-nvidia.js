import OpenAI from "openai"
const openai = new OpenAI({
  apiKey: process.env.NVIDIA_APIKEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
})
let handler = async (m, { conn, usedPrefix, command, text, senderKey }) => {
  try {
    if (!conn.nvidia) conn.nvidia = {}
    if (!text) return m.reply(`Masukan text! \n\nContoh : \n${usedPrefix + command} siapa kamu`)
    await conn.loading(m, conn)
    if (!(senderKey in conn.nvidia)) {
      conn.nvidia[senderKey] = {
        timeOut: setTimeout(() => {
          delete conn.nvidia[senderKey]
        }, 600000),
        messages: [],
      }
    } else {
      clearTimeout(conn.nvidia[senderKey].timeOut)
    }
    let nvidia = conn.nvidia[senderKey]

    const completion = await openai.chat.completions.create({
      model: "meta/llama-3.1-405b-instruct",
      messages: [
        ...nvidia.messages,
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
    nvidia.messages.push(
      {
        role: "user",
        content: text,
      },
      {
        role: "assistant",
        content: response,
      }
    )
    nvidia.timeOut = setTimeout(() => {
      delete conn.nvidia[senderKey]
    }, 600000)
  } finally {
    await conn.loading(m, conn, true)
  }
}
handler.help = ["nvidia", "openai"]
handler.tags = ["internet"]
handler.command = /^(nvidia|openai|ai)$/i
handler.limit = true
handler.onlyprem = true
export default handler
