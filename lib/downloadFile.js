import fs from "fs"
import path from "path"
import fetch from "node-fetch"
import { fileTypeFromBuffer } from "file-type"

async function downloadFile(input, saveToFile = false) {
  let res
  let fullPath
  let buffer

  switch (true) {
    case Buffer.isBuffer(input):
      buffer = input
      break

    case input instanceof ArrayBuffer:
      buffer = Buffer.from(input)
      break

    case typeof input === "string" && /^data:.*?\/.*?;base64,/i.test(input):
      buffer = Buffer.from(input.split(",")[1], "base64")
      break

    case typeof input === "string" && /^[\w+/=]+$/.test(input):
      buffer = Buffer.from(input, "base64")
      break

    case typeof input === "string" && /^https?:\/\//.test(input):
      buffer = await fetchWithRetry(input, 3)
      break

    case typeof input === "string" && fs.existsSync(input):
      fullPath = input
      buffer = fs.readFileSync(fullPath)
      break

    case typeof input === "string":
      buffer = Buffer.from(input)
      break

    default:
      buffer = Buffer.alloc(0)
  }

  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError("Result is not a buffer")
  }

  const type = (await fileTypeFromBuffer(buffer)) || {
    mime: "application/octet-stream",
    ext: "bin",
  }

  if (saveToFile && !fullPath) {
    const uploadsDir = path.join(process.cwd(), "tmp")
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const fileName = typeof saveToFile === "string" ? saveToFile : `${Date.now()}.${type.ext}`

    fullPath = path.join(uploadsDir, fileName)

    await fs.promises.writeFile(fullPath, buffer)
  }

  return {
    res,
    filename: fullPath,
    mime: type.mime,
    ext: type.ext,
    data: buffer,
    deleteFile: () => (fullPath ? fs.promises.unlink(fullPath) : Promise.resolve()),
  }
}

async function fetchWithRetry(url, retries = 3, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0", Accept: "*/*" },
        // node-fetch versi lama tidak support timeout, abaikan atau gunakan library lain jika perlu
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.buffer()
    } catch (err) {
      if (i === retries - 1) throw err
      await new Promise((res) => setTimeout(res, delayMs))
    }
  }
  throw new Error("Unreachable retry failure")
}

export default downloadFile
