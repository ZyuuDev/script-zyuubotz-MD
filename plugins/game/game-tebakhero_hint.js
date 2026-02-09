let handler = async (m, { conn }) => {
    conn.tebakhero = conn.tebakhero ? conn.tebakhero : {}
    let id = m.chat
    if (!(id in conn.tebakhero)) throw false
    let json = conn.tebakhero[id][1]
    m.reply('Clue : ' + '```' + json.jawaban.replace(/[AIUEOaiueo]/ig, '_') + '```' + '\n\n_*Jangan Balas Chat Ini Tapi Balas Soalnya*_')
}
handler.command = /^hro$/i
handler.limit = true
export default handler