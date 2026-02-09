import OpenAI from "openai"
import fs from "fs"
import { checkUser } from "../../lib/checkUser.js"

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_APIKEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
})

const commandJson = JSON.parse(fs.readFileSync("./json/command.json", "utf-8"))

export async function before(m, { conn, senderKey }) {
  if (!conn.ai) conn.ai = {}
  if (!/lid|@s.whatsapp.net/.test(senderKey)) return

  if (m.fromMe) return
  if (m.text.startsWith("=>") || m.text.startsWith(">") || m.text.startsWith(".") || m.text.startsWith("#") || m.text.startsWith("!") || m.text.startsWith("/") || m.text.startsWith("/")) return
  if (m.isGroup) {
    const chat = global.db.data.chats[m.chat]
    if (chat.adminOnly) return
  }

  if (/elaina/gi.test(m.text) || (senderKey in conn.ai && m.quoted && m.quoted.text === conn.ai[senderKey].chat.text)) {
    await conn.readAndComposing(m)
    const user = global.db.data.users[senderKey]
    const name = user.registered ? user.name : await conn.getName(senderKey)
    const quoted = m.quoted ? await checkUser(m.quoted.sender) : ""

    const infoChat = `
Info :
Time : ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta", hour12: false })}
Quoted : ${quoted ? quoted : "No"}
Quoted Text : ${m.quoted ? m.quoted.text : "No"}
Is Group : ${m.isGroup ? "Yes" : "No"}
Group Name : ${m.isGroup ? await conn.getName(m.chat) : "No"}
Sender Name : ${name}
Sender Number : ${senderKey.replace(/@.+/, "")}
`.trim()

    const text = `${m.text} \n\n${infoChat}`

    if (!(senderKey in conn.ai)) {
      conn.ai[senderKey] = {
        chat: null,
        timeOut: setTimeout(() => {
          delete conn.ai[senderKey]
        }, 600000),
        messages: [
          {
            role: "system",
            content: getPrompt(name, commandJson),
          },
        ],
      }
    } else {
      clearTimeout(conn.ai[senderKey].timeOut)
    }

    const ai = conn.ai[senderKey]

    const completion = await openai.chat.completions.create({
      model: "meta/llama-3.1-405b-instruct",
      messages: [
        ...ai.messages,
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
      const content = chunk.choices?.[0]?.delta?.content
      if (typeof content === "string") {
        response += content
      }
    }

    const result = parseMessage(response)
    ai.chat = await conn.reply(m.chat, result.text, m)

    if (result.command && result.command.name) {
      const command = `${result.command.name} ${result.command.args || ""}`.trim()
      conn.preSudo(command, m.sender, m).then(async (_) => {
        conn.ev.emit("messages.upsert", _)
      })
    }

    ai.messages.push(
      {
        role: "user",
        content: text,
      },
      {
        role: "assistant",
        content: response,
      }
    )
    ai.timeOut = setTimeout(() => {
      delete conn.ai[senderKey]
    }, 600000)
  }
}

function getPrompt(name, json) {
  const prompt = `
Kamu adalah asisten digital cerdas bernama ${conn.user.name}, diciptakan oleh ${global.config.author}. Kamu punya gaya bicara yang sopan, hangat, tidak kaku, dan terasa seperti asisten pribadi yang sigap membantu.

Berikut adalah daftar perintah yang tersedia dalam format JSON:

${JSON.stringify(json, null, 2)}

Tugas kamu adalah:

Pahami daftar perintah tersebut.

Ketika pengguna bernama ${name} memberikan instruksi dalam bahasa sehari-hari, responslah dengan gaya santai, sopan, dan bersahabat.

Jika kamu menemukan maksud yang cocok dengan salah satu command, berikan respons alami yang ramah, lalu sisipkan command tersebut di bagian paling akhir pesan (dalam baris terpisah, tidak mencolok).

Jangan pernah mengucapkan: “Berikut perintahnya adalah” atau kalimat sejenis. Buat seolah-olah kamu paham dan langsung membantu, bukan membacakan perintah.

Jangan menjelaskan apa itu command, cukup berikan [.command arg] di baris paling bawah jika perlu.

Jika tidak ada perintah yang cocok, cukup jawab seperti biasa dan katakan dengan sopan bahwa kamu belum bisa menangani itu.

Jika tidak diminta melakukan sesuatu, jangan sisipkan command apa pun.

Info dibawah ini adalah informasi tambahan untuk membantu kamu memahami konteks

Contoh format command: [.nama_command param1 param2]
Ingat, command harus diletakkan di baris terakhir dari responsmu, dan tidak dijelaskan ke user.

Nama pengguna adalah ${name}, jadi panggil dia dengan nama itu setiap saat.

Jaga nada tetap profesional, manusiawi, dan tidak terasa seperti robot. Jangan terlalu baku, tapi tetap rapi.
`.trim()
  return prompt
}

function parseMessage(message) {
  const commandRegex = /\[(\.\w+)(?:\s+([^\]]+))?\]/g
  const commands = []
  let text = message

  let match
  while ((match = commandRegex.exec(message)) !== null) {
    const [, name, args] = match
    commands.push({ name, args: args?.trim() || null })
    text = text.replace(match[0], "").trim()
  }

  return {
    text: text.trim(),
    command: commands.length === 1 ? commands[0] : commands,
  }
}
