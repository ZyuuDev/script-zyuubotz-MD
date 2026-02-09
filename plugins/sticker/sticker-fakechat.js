import uploadFile from '../../lib/uploadFile.js'
import axios from 'axios'
import { sticker } from '../../lib/sticker.js'

let handler = async (m, { conn, text, usedPrefix, command, isOwner }) => {
    try {
        let q = m.quoted && !text ? m.quoted: m
        let mime = (q.msg || q).mimetype || ''
        let txt = text ? text: typeof q.text == 'string' ? q.text: ''
        if (!txt) return m.reply(`Masukan text \n\nContoh: \n${usedPrefix + command} halo`)
        await conn.loading(m, conn)
        let avatar = await conn.profilePictureUrl(q.sender, 'image').catch(_ => 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjCX5TOKkOk3MBt8V-f8PbmGrdLHCi4BoUOs_yuZ1pekOp8U_yWcf40t66JZ4_e_JYpRTOVCl0m8ozEpLrs9Ip2Cm7kQz4fUnUFh8Jcv8fMFfPbfbyWEEKne0S9e_U6fWEmcz0oihuJM6sP1cGFqdJZbLjaEQnGdgJvcxctqhMbNw632OKuAMBMwL86/w640-h596/pp%20kosong%20wa%20default.jpg')
        if (!/image\/(jpe?g|png)|opus|webp/i.test(mime)) {
            let req = await fakechat(txt, q.name, avatar)
            let stiker = await sticker(false, req, global.config.stickpack, global.config.stickauth)
            await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
        } else {
            let img = await q.download()
            let files = await uploadFile(img)
            let req = await fakechat(txt, q.name, avatar, files)
            let stiker = await sticker(false, req, global.config.stickpack, global.config.stickauth)
            await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
        }
    } finally {
        await conn.loading(m, conn, true)
    }
}
handler.help = ['fakechat']
handler.tags = ['sticker']
handler.command = /^(fc|qc|fakechat)$/i
handler.limit = true
handler.onlyprem = true
export default handler

async function fakechat(text, name, avatar, url = false) {
    let body1 = {
        "type": "quote",
        "format": "png",
        "backgroundColor": "#FFFFFF",
        "width": 512,
        "height": 768,
        "scale": 2,
        "messages": [{
            "entities": [],
            "media": {
                "url": url
            },
            "avatar": true,
            "from": {
                "id": 1,
                "name": name,
                "photo": {
                    "url": avatar
                }
            },
            "text": text,
            "replyMessage": {}
        }]
    }

    let body2 = {
        "type": "quote",
        "format": "webp",
        "backgroundColor": "#FFFFFF",
        "width": 512,
        "height": 512,
        "scale": 2,
        "messages": [{
            "avatar": true,
            "from": {
                "first_name": name,
                "language_code": "en",
                "name": name,
                "photo": {
                    "url": avatar
                }
            },
            "text": text,
            "replyMessage": {}
        }]
    }

    let { data } = await axios.post('https://quote.ryhar.my.id/generate', url ? body1: body2)
    return Buffer.from(data.result.image, "base64")
}