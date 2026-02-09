import midtransClient from "midtrans-client"

const midtrans = new midtransClient.CoreApi({
  isProduction: !opts["test"],
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
})

export async function createQris(nominal, orderId) {
  if (!nominal) throw new Error("Nominal is required")

  const response = await midtrans.charge({
    payment_type: "qris",
    transaction_details: {
      order_id: orderId,
      gross_amount: nominal,
    },
  })

  if (response.status_code !== "201") {
    throw new Error(`Failed to create QRIS: ${response.status_message}`)
  }

  return response
}
