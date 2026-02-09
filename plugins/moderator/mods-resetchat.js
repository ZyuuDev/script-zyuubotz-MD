import fetch from "node-fetch"
let handler = async (m) => {
  let arr = Object.entries(db.data.chats)
    .filter((user) => !user[1].expired >= 1)
    .map((user) => user[0])
  let boy = `Sukses Menghapus ${arr.length} Chat`
  for (let x of arr) delete db.data.chats[x]
  await m.reply(boy)
}
handler.help = ["resetchat"]
handler.tags = ["mods"]
handler.command = /^(resetchat)$/i
handler.mods = true
export default handler
