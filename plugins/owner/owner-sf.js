import * as os from 'os'
import fs from 'fs'
import path from 'path'

let handler = async (m, { usedPrefix, command, text, __dirname }) => {
	if (!text) return m.reply(`Mau disimpan kemana?\n\n*Contoh:*\n${usedPrefix + command} group/afk.js`)
	if (!m.quoted?.text) return m.reply(`Balas pesan nya!`)
	let dir = path.join(__dirname, /\.[a-zA-Z0-9]+$/.test(text) ? `./../${text}` : `./${text}.js`)
	try {
		await fs.promises.writeFile(dir, m.quoted.text)
		m.reply(`Disimpan di '${dir.replace(__dirname, `${os.platform() == 'win32' ? '\\' : '/'}plugins`)}'`)
	} catch (e) {
		console.log(e)
		return m.reply(`Error: ENOENT: no such file or directory, open '${dir}'`)
	}
}

handler.help = ['saveplugin']
handler.tags = ['mods']
handler.command = /^((save|sf)(plugins?)?|pluginsave)$/i
handler.mods = true
export default handler