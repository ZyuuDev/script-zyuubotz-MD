let handler = async(m, { senderKey, conn }) => {
    let msg = await conn.sendContact(m.chat, global.config.owner, m)
    await delay(1000)
    await conn.sendMessage(m.chat, { text: `Hallo Kak @${senderKey.split('@')[0]}, Itu Nomor Ownerku Jangan Di Spam Ya!`, mentions: [senderKey] }, { quoted: msg })
}
handler.help = ['owner']
handler.tags = ['info']
handler.command = /^(owner|creator)$/i

export default handler

const delay = time => new Promise(res => setTimeout(res, time))
