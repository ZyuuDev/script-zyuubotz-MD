let handler = async (m, { senderKey, conn, text }) => {
    if (!text && !m.quoted) return m.reply(`Masukkan teks untuk status atau reply gambar/video/audio dengan caption`)
    let media = null
    let options = {}
    const user = global.db.data.users[senderKey]
    const jids = [senderKey, m.chat]
    const footer = ` ~ ${user.registered ? user.name : await conn.getName(senderKey)}`

    if (m.quoted) {
        const mime = m.quoted.mtype || m.quoted.mediaType

        if (mime.includes('image')) {
            media = await m.quoted.download()
            options = {
                image: media,
                caption: (text || m.quoted.text || '') + footer
            }
        } else if (mime.includes('video')) {
            media = await m.quoted.download()
            options = {
                video: media,
                caption: (text || m.quoted.text || '') + footer
            }
        } else if (mime.includes('audio')) {
            media = await m.quoted.download()
            options = {
                audio: media,
                mimetype: 'audio/mp4',
                ptt: true,
            }
        } else {
            options = {
                text: (text || m.quoted.text || '') + footer
            }
        }
    } else {
        options = {
            text: text + footer
        }
    }

    await conn.sendMessage("status@broadcast", options, {
        backgroundColor: "#7ACAA7",
        font: 1,
        textArgb: 0xffffffff,
        statusJidList: m.chat.endsWith("@g.us") ? await (await conn.groupMetadata(m.chat)).participants.map((a) => a.id) : [senderKey],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: jids.map((jid) => ({
                            tag: "to",
                            attrs: { jid: m.chat },
                            content: undefined,
                        })),
                    },
                ],
            },
        ],
    })

    m.reply('Status berhasil diupload!')
}

handler.help = ['upsw']
handler.tags = ['premium']
handler.command = /^(upsw)$/i
handler.premium = true
export default handler