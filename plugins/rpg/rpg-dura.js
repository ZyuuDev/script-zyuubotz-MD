let handler = async (m, { senderKey, conn }) => {
    let user = global.db.data.users[senderKey]
    let toolsList = Object.keys(tools).map(tool => {
        if (user[tool]) {
            let toolName = typeof tools[tool] === 'object' ? tools[tool][user[tool]?.toString()] : `Level(s) ${toRupiah(user[tool])}`
            return `*${global.rpg.emoticon(tool)} ${tool}:* ${toolName}
Durability: ${toRupiah(user[tool + "durability"])}`
        }
        return null
    }).filter(v => v).join('\n').trim()
    
    let text = `
*LIST TOOLS KAMU:*

${toolsList}
`.trim()
    m.reply(text)
}

handler.help = ['cekdura']
handler.tags = ['rpg']
handler.command = /^(cekdura)$/i
export default handler

const tools = {
    armor: {
        '0': '❌',
        '1': 'Leather Armor',
        '2': 'Iron Armor',
        '3': 'Gold Armor',
        '4': 'Diamond Armor',
        '5': 'Emerald Armor',
        '6': 'Crystal Armor',
        '7': 'Obsidian Armor',
        '8': 'Netherite Armor',
        '9': 'Wither Armor',
        '10': 'Dragon Armor',
        '11': 'Hacker Armor'
    },
    sword: {
        '0': '❌',
        '1': 'Wooden Sword',
        '2': 'Stone Sword',
        '3': 'Iron Sword',
        '4': 'Gold Sword',
        '5': 'Copper Sword',
        '6': 'Diamond Sword',
        '7': 'Emerald Sword',
        '8': 'Obsidian Sword',
        '9': 'Netherite Sword',
        '10': 'Samurai Slayer Green Sword',
        '11': 'Hacker Sword'
    },
    pickaxe: {
        '0': '❌',
        '1': 'Wooden Pickaxe',
        '2': 'Stone Pickaxe',
        '3': 'Iron Pickaxe',
        '4': 'Gold Pickaxe',
        '5': 'Copper Pickaxe',
        '6': 'Diamond Pickaxe',
        '7': 'Emerlad Pickaxe',
        '8': 'Crystal Pickaxe',
        '9': 'Obsidian Pickaxe',
        '10': 'Netherite Pickaxe',
        '11': 'Hacker Pickaxe'
    },
    fishingrod: {
        '0': '❌',
        '1': 'Wooden Fishingrod',
        '2': 'Stone Fishingrod',
        '3': 'Iron Fishingrod',
        '4': 'Gold Fishingrod',
        '5': 'Copper Fishingrod',
        '6': 'Diamond Fishingrod',
        '7': 'Emerald Fishingrod',
        '8': 'Crystal Fishingrod',
        '9': 'Obsidian Fishingrod',
        '10': 'God Fishingrod',
        '11': 'Hacker Fishingrod'
    }
}

function toRupiah(number) {
    return new Intl.NumberFormat('id-ID').format(number)
}