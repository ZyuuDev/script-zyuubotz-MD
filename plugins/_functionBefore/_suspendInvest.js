export async function before(m, { conn, senderKey }) {
  if (!/lid|@s.whatsapp.net/.test(senderKey)) return
  let crypto = global.db.data.bots.invest.item
  let saham = global.db.data.bots.saham.item
  Object.keys(crypto).forEach((key) => {
    let dataCrypto = crypto[key]
    if (dataCrypto.harga == 1) dataCrypto.suspend = true
  })
  Object.keys(saham).forEach((key) => {
    let dataSaham = saham[key]
    if (dataSaham.harga == 1) dataSaham.suspend = true
  })
}
