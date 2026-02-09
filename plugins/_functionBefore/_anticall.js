export async function before(m, { conn, senderKey }) {
  if (!/lid|@s.whatsapp.net/.test(senderKey)) return
  conn.ev.on("call", async (call) => {
    if (call[0].status == "offer" && global.db.data.settings[conn.user.jid].anticall) await conn.rejectCall(call[0].id, call[0].from)
  })
  return !0
}
