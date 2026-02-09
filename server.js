import express from "express"
import crypto from "crypto"

const app = express()
const port = process.env.PORT || 3000
const serverKey = process.env.MIDTRANS_SERVER_KEY || ""

app.use(express.json())

app.post("/midtrans/callback", (req, res) => {
  const body = req.body

  if (!body || !body.order_id || !body.status_code || !body.gross_amount || !body.signature_key) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  const signature = generateMidtransSignature(body.order_id, body.status_code, body.gross_amount, serverKey)

  if (signature !== body.signature_key) {
    return res.status(400).json({ error: "Invalid signature" })
  }

  const bot = global.db.data.bots
  const key = Object.keys(bot.transaksi).find((v) => v === body.order_id)

  if (!key) {
    return res.status(200).json({ success: true })
  }

  bot.transaksi[key].status = body.transaction_status
  return res.status(200).json({ success: true })
})

app.listen(port, () => {
  console.log(`Callback API aktif di http://localhost:${port}`)
})

app.get("/ping", (req, res) => res.send("pong"))

function generateMidtransSignature(order_id, status_code, gross_amount, server_key) {
  const input = order_id + status_code + gross_amount + server_key
  return crypto.createHash("sha512").update(input).digest("hex")
}
