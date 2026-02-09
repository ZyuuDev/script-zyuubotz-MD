let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) return m.reply(`Masukan nama command! \n\nContoh : \n${usedPrefix + command} diamond`)
  let store = global.db.data.chats[m.chat].store
  if (!store || !store.hasOwnProperty(text)) return m.reply(`Nama command tersebut tidak ditemukan`)
  m.reply(`Sukses menghapus command ${text}`).then(() => {
    delete store[text]
  })
}
handler.help = ["dellist"]
handler.tags = ["store"]
handler.command = /^(del(ete)?(store|list))$/i
handler.admin = true
handler.group = true
export default handler
