export async function before(m, { senderKey, conn }) {
  if (!/lid|@s.whatsapp.net/.test(senderKey)) return
  if (!conn.verif) conn.verif = {}
  if (!(senderKey in conn.verif) || m.fromMe) return

  const user = global.db.data.users
  const bot = global.db.data.bots.users

  if (conn.verif[senderKey].codeEmail && m.text === conn.verif[senderKey].codeEmail) {
    conn.readAndComposing(m)

    if (Date.now() - conn.verif[senderKey].lastCode > 180000) {
      return m.reply("Kode verifikasi telah Expired!")
    }

    if (conn.verif[senderKey].login) {
      const dataUser = Object.keys(user).find((v) => user[v].email === conn.verif[senderKey].login)
      const dataBot = Object.keys(bot).find((v) => bot[v].email === conn.verif[senderKey].login)

      if (dataUser) {
        user[senderKey] = { ...user[dataUser], verif: true }
        delete user[dataUser]
      } else if (dataBot) {
        user[senderKey] = { ...bot[dataBot], verif: true }
        delete bot[dataBot]
      }
      m.reply("Login berhasil! Email terverifikasi dan akun berhasil dipindahkan.")
      delete conn.verif[senderKey]
    } else {
      m.reply(`Email telah terverifikasi!\nLimit chat kamu telah menjadi 1000`)
      user[senderKey].verif = true
      user[senderKey].email = conn.verif[senderKey].email
      user[senderKey].commandLimit = 1000
    }
    delete conn.verif[senderKey]
  }
}
