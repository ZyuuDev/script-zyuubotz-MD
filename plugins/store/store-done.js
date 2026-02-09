import { checkUser } from "../../lib/checkUser.js"

let handler = async (m, { conn }) => {
  if (!conn.prosesTransaksi) conn.prosesTransaksi = {}
  let target = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
  if (!target) return m.reply("Tag User Yang Ingin Diselesaikan Transaksinya")
  const id = await checkUser(conn, target)
  if (!conn.prosesTransaksi[id]) return m.reply(`User ${await conn.tagUser(id)} Tidak Sedang Dalam Proses Transaksi`)
  const caption = `*「 SELESAI TRANSAKSI 」*\n\nTransaksi Oleh : ${await conn.tagUser(conn.prosesTransaksi[id].by)}\nUser : ${await conn.tagUser(id)}\nWaktu Mulai : ${new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(conn.prosesTransaksi[id].waktu))}\nWaktu Selesai : ${new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date())}\nGrup : ${conn.prosesTransaksi[id].group}\n\nCatatan : ${conn.prosesTransaksi[id].catatan}\n\n_Transaksi Selesai_`.trim()
  m.reply(caption)
  delete conn.prosesTransaksi[id]
}
handler.help = ["done"]
handler.tags = ["store"]
handler.command = /^(done|selesai)$/i
handler.group = true
handler.admin = true
export default handler
