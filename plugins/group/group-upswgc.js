import * as baileys from "@whiskeysockets/baileys"
import crypto from "crypto"
import { PassThrough } from "stream"
import ffmpeg from "fluent-ffmpeg"

let handler = async (m, { conn, text, isAdmin }) => {
  let [textInput, color, url] = text.split("|")

  if (url && !isAdmin) return m.reply("⚠️ Hanya admin grup yang dapat menggunakan perintah ini!")

  let id
  if (url) {
    const inviteCode = url.split("/").pop().split("?")[0]
    let groupInfo = await conn.groupGetInviteInfo(inviteCode)
    id = groupInfo.id
  } else {
    id = m.chat
  }

  // Fallback ke pesan yang dikutip atau pesan saat ini
  let quoted = m.quoted || m
  let caption = quoted.caption || textInput

  // Ambil informasi MIME type
  let q = quoted
  let mime = q?.mimetype || q?.msg?.mimetype || ""

  // Jika media adalah gambar
  if (/image/.test(mime)) {
    const buffer = await quoted.download().catch(() => null)
    if (!buffer) return m.reply("⚠️ Gagal mengunduh gambar!")

    const status = await groupStatus(conn, id, {
      image: buffer,
      caption: caption,
    })
    return conn.reply(m.chat, "✅ Status berhasil diupload! Cek di balasan pesan ini.", status)
  }
  // Jika media adalah video
  else if (/video/.test(mime)) {
    const buffer = await quoted.download().catch(() => null)
    if (!buffer) return m.reply("⚠️ Gagal mengunduh video!")

    const status = await groupStatus(conn, id, {
      video: buffer,
      caption: caption,
    })
    return conn.reply(m.chat, "✅ Status berhasil diupload! Cek di balasan pesan ini.", status)
  }
  // Jika media adalah audio
  else if (/audio/.test(mime)) {
    const buffer = await quoted.download().catch(() => null)
    if (!buffer) return m.reply("⚠️ Gagal mengunduh audio!")

    const audioVN = await toVN(buffer)
    const audioWaveform = await generateWaveform(buffer)

    const status = await groupStatus(conn, id, {
      audio: audioVN,
      waveform: audioWaveform,
      mimetype: "audio/ogg; codecs=opus",
      ptt: true,
    })
    return conn.reply(m.chat, "✅ Status berhasil diupload! Cek di balasan pesan ini.", status)
  }
  // Jika status teks dengan warna
  else if (color) {
    if (!caption) return m.reply("⚠️ Tidak ada teks untuk diupload ke status grup!")

    const whatsappStatusColors = new Map([
      ["biru", "#34B7F1"],
      ["hijau", "#25D366"],
      ["kuning", "#FFD700"],
      ["jingga", "#FF8C00"],
      ["merah", "#FF3B30"],
      ["ungu", "#9C27B0"],
      ["abu", "#9E9E9E"],
      ["hitam", "#000000"],
      ["putih", "#FFFFFF"],
      ["cyan", "#00BCD4"],
    ])

    const colorText = color.toLowerCase()
    let backgroundColor = null

    for (const [name, code] of whatsappStatusColors.entries()) {
      if (colorText.includes(name)) {
        backgroundColor = code
        break
      }
    }

    if (!backgroundColor) {
      return m.reply("⚪ Warna tidak ditemukan. Pilihan warna: biru, hijau, kuning, jingga, merah, ungu, abu, hitam, putih, cyan")
    }

    const status = await groupStatus(conn, id, {
      text: caption,
      backgroundColor: backgroundColor,
    })
    return conn.reply(m.chat, "✅ Status berhasil diupload! Cek di balasan pesan ini.", status)
  }
  // Jika tidak ada media atau format tidak sesuai
  else {
    return m.reply("⚠️ Cara penggunaan:\n" + "• Reply media (gambar/video/audio)\n" + "• Atau kirim: teks|warna\n" + "• Tambahkan |link_grup untuk upload ke grup tertentu")
  }
}

/**
 * Mengirim status WhatsApp ke grup.
 * @param {import("@adiwajshing/baileys").WASocket} conn - Koneksi WhatsApp
 * @param {string} jid - ID grup tujuan
 * @param {import("@adiwajshing/baileys").AnyMessageContent} content - Konten status
 * @returns {Promise} Message object
 */
async function groupStatus(conn, jid, content) {
  const { backgroundColor } = content
  delete content.backgroundColor

  const inside = await baileys.generateWAMessageContent(content, {
    upload: conn.waUploadToServer,
    backgroundColor,
  })

  const messageSecret = crypto.randomBytes(32)
  const message = baileys.generateWAMessageFromContent(
    jid,
    {
      messageContextInfo: { messageSecret },
      groupStatusMessageV2: {
        message: {
          ...inside,
          messageContextInfo: { messageSecret },
        },
      },
    },
    {}
  )

  await conn.relayMessage(jid, message.message, { messageId: message.key.id })
  return message
}

handler.help = ["upswgc"]
handler.tags = ["tools"]
handler.command = /(up)?swgc/i
handler.admin = true

export default handler

/**
 * Mengonversi audio ke format Voice Note WhatsApp (Opus OGG).
 * @param {Buffer} inputBuffer - Buffer audio input
 * @returns {Promise<Buffer>} Buffer audio dalam format Voice Note
 */
async function toVN(inputBuffer) {
  return new Promise((resolve, reject) => {
    const inStream = new PassThrough()
    const outStream = new PassThrough()
    const chunks = []

    inStream.end(inputBuffer)

    ffmpeg(inStream)
      .noVideo()
      .audioCodec("libopus")
      .format("ogg")
      .audioBitrate("48k")
      .audioChannels(1)
      .audioFrequency(48000)
      .outputOptions(["-map_metadata", "-1", "-application", "voip", "-compression_level", "10", "-page_duration", "20000"])
      .on("error", reject)
      .on("end", () => resolve(Buffer.concat(chunks)))
      .pipe(outStream, { end: true })

    outStream.on("data", (chunk) => chunks.push(chunk))
  })
}

/**
 * Generate waveform untuk audio Voice Note.
 * @param {Buffer} inputBuffer - Buffer audio input
 * @param {number} bars - Jumlah bar dalam waveform (default: 64)
 * @returns {Promise<string>} Waveform dalam format base64
 */
async function generateWaveform(inputBuffer, bars = 64) {
  return new Promise((resolve, reject) => {
    const inputStream = new PassThrough()
    inputStream.end(inputBuffer)

    const chunks = []

    ffmpeg(inputStream)
      .audioChannels(1)
      .audioFrequency(16000)
      .format("s16le")
      .on("error", reject)
      .on("end", () => {
        const rawData = Buffer.concat(chunks)
        const samples = rawData.length / 2

        // Ekstrak amplitudo dari raw audio data
        const amplitudes = []
        for (let i = 0; i < samples; i++) {
          let value = rawData.readInt16LE(i * 2)
          amplitudes.push(Math.abs(value) / 32768)
        }

        // Hitung rata-rata per blok
        let blockSize = Math.floor(amplitudes.length / bars)
        let averages = []
        for (let i = 0; i < bars; i++) {
          let block = amplitudes.slice(i * blockSize, (i + 1) * blockSize)
          averages.push(block.reduce((a, b) => a + b, 0) / block.length)
        }

        // Normalisasi ke range 0-100
        let maxValue = Math.max(...averages)
        let normalized = averages.map((v) => Math.floor((v / maxValue) * 100))

        let buffer = Buffer.from(new Uint8Array(normalized))
        resolve(buffer.toString("base64"))
      })
      .pipe()
      .on("data", (chunk) => chunks.push(chunk))
  })
}
