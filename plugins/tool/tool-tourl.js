import uploadFile from '../../lib/uploadFile.js'
let handler = async (m) => {
    try {
        let q = m.quoted ? m.quoted: m
        let mime = (q.msg || q).mimetype || ''
        if (!mime) return m.reply('No media found')
        await conn.loading(m, conn)
        let media = await q.download()
        let files = await uploadFile(media)
        await m.reply(`📮 *L I N K :*
${files}
📊 *S I Z E :* ${media.length} Byte
📛 *E x p i r e d :* No Expiry Date`)
    } catch (e) {
        throw e
    } finally {
        await conn.loading(m, conn, true)
    }
}
handler.help = ['tourl']
handler.tags = ['tools']
handler.command = /^(tourl|upload)$/i

export default handler