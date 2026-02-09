import { createHash } from 'crypto'

let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i
let handler = async function (m, { senderKey }) {
    let sn = createHash('md5').update(senderKey).digest('hex').slice(0, 12)
    let caption = `🗃️ *SN :* \n${sn}`
    m.reply(caption, false, false, { smlcap: true, except: [sn] })
}

handler.help = ['ceksn']
handler.tags = ['xp']
handler.command = /^(ceksn|sn|serialnumber)$/i
handler.register = true
export default handler