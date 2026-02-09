import { createHash } from 'crypto'
import fs from 'fs'
let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i

let handler = async function (m, { conn, text, usedPrefix, command, senderKey }) {
    try {
        let hwaifu = JSON.parse(fs.readFileSync('./json/hwaifu.json', 'utf-8'))
        let pp = await conn.profilePictureUrl(senderKey, 'image').catch(_ => fs.readFileSync('./src/avatar_contact.png'))
        let users = global.db.data.users
        let user = users[senderKey]

        if (user.registered === true) return m.reply(`[💬] Kamu sudah terdaftar\nMau daftar ulang? *${usedPrefix}unreg <SERIAL NUMBER>*`)
        let list = []

        for (let i = 6; i < 71; i++) {
            list.push([`${usedPrefix + command} ${await conn.getName(senderKey)}.${i}`, i.toString(), "Umur " + i])
        }

        if (!Reg.test(text)) return conn.textList(m.chat, `Nama kamu : *${await conn.getName(senderKey)}* \nSilahkan pilih umur kamu dibawah, untuk melanjutkan registrasi bot WhatsApp`, false, list, m, { noList: true, 
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: false,
                    mediaType: 1,
                    title: "Hallo " + await conn.getName(senderKey),
                    body: global.config.watermark,
                    thumbnail: fs.readFileSync("./media/thumbnail.jpg"),
                    renderLargerThumbnail: true,
                    mediaUrl: pickRandom(hwaifu),
                    sourceUrl: global.config.website
                }
            }
        })

        let [_, name, splitter, age] = text.match(Reg)
        if (!name) return m.reply('Nama tidak boleh kosong (Alphanumeric)')
        if (!age) return m.reply('Umur tidak boleh kosong (Angka)')

        age = parseInt(age)
        if (age > 70) return m.reply('WOI TUA (。-`ω´-)')
        if (age < 5) return m.reply('Halah dasar bocil')
        if (name.split('').length > 30) return m.reply('Nama Maksimal 30 Karakter')

        await conn.loading(m, conn)

        user.name = name.trim()
        user.age = age
        user.regTime = + new Date
        user.commandLimit = user.commandLimit === 1000 ? user.commandLimit : 100
        user.registered = true

        let sn = createHash('md5').update(senderKey).digest('hex').slice(0, 12)
        let cap = `
┏─• *Users*
│▸ *Status:* ☑️ Succes
│▸ *Nama:* ${name}
│▸ *Umur:* ${age} Tahun
│▸ *Serial Number:* ${sn}
┗────···

Pendaftaran Selesai!
`.trim()
        await conn.sendFile(m.chat, pp, name + '.jpeg', cap, m, false, false, { smlcap: true, except: [sn] })
    } finally {
        await conn.loading(m, conn, true)
    }
}
handler.help = ['daftar']
handler.tags = ['xp']
handler.command = /^(daftar|verify|reg(ister)?)$/i
handler.private = true
export default handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}