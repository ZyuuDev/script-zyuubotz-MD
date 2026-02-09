import { checkUser } from "../../lib/checkUser.js"

let handler = async (m, { conn, senderKey, text }) => {
  if (!conn.prosesTransaksi) conn.prosesTransaksi = {}
  let target = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
  if (!target) return m.reply("Tag User Yang Ingin Diproses Transaksinya")
  const id = await checkUser(conn, target)
  if (conn.prosesTransaksi[id]) return m.reply(`User ${conn.tagUser(id)} Sedang Dalam Proses Transaksi`)
  conn.prosesTransaksi[id] = {
    waktu: Date.now(),
    by: senderKey,
    to: id,
    chat: m.chat,
    catatan: text ? text : m.quoted ? m.quoted.text : "Tidak Ada Catatan",
    group: await conn.getName(m.chat),
  }
  const caption = `*「 PROSES TRANSAKSI 」*\n\nTransaksi Oleh : ${await conn.tagUser(senderKey)}\nUser : ${await conn.tagUser(id)}\nWaktu : ${new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(conn.prosesTransaksi[id].waktu))}\n\nCatatan : ${text ? text : m.quoted ? m.quoted.text : "Tidak Ada Catatan"}\n\n_Untuk menyelesaikan transaksi, silahkan kirim perintah_ *.done*`.trim()
  m.reply(caption)
}
handler.help = ["proses"]
handler.tags = ["store"]
handler.command = /^(proses)$/i
handler.admin = true
handler.group = true
export default handler
