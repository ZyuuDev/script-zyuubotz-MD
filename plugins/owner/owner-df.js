import { join } from 'path'
import { unlinkSync, existsSync } from 'fs'
import { plugins } from '../../lib/plugins.js'

let handler = async (m, { conn, usedPrefix, __dirname, args, text, command }) => {
    let setting = global.db.data.settings[conn.user.jid]
    let ar = Object.keys(plugins)
    let ar1 = ar.map(v => v.replace('.js', '').replace('plugins/', ''))

    if (!text) return m.reply(`Uhm... where the text?\n\nExample:\n${usedPrefix + command} main/afk`)
    if (!ar1.includes(args[0])) return conn.sendMessage(m.chat, { text: `${setting.smlcap ? conn.smlcap("*🗃️ NOT FOUND!*") : "*🗃️ NOT FOUND!"}\n==================================\n\n${ar1.map(v => ' ' + v).join`\n`}` }, { quoted: m })

    const file = join(__dirname, '../plugins', args[0] + '.js')
    if (existsSync(file)) {
        unlinkSync(file)
        conn.reply(m.chat, `Success deleted "plugins/${args[0]}.js"`, m)
    } else {
        conn.reply(m.chat, `File "plugins/${args[0]}.js" does not exist`, m)
    }
}

handler.help = ['deletefile']
handler.tags = ['owner']
handler.command = /^(df|deletefile)$/i
handler.mods = true
export default handler