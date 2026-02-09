let handler = async (m, { conn, usedPrefix, command, text }) => {
    text = m.quoted ? m.quoted.text : text
    if (!text) return m.reply(`
Masukan Data Yang Ingin Direkap!

Contoh:

RyHar Team:
Ry 67
Bayu 51
Fajri 916

Barudak Team:
Gororo 92
Matasi 816
Guara 826
`.trim())
    text = text.replace(/\*/g, "").replace(/LF/g, "").replace(/🤖/gi, '')
    let result = parseStringToJson(text)
    console.error(result)
    let caption = processData(result)
    m.reply(caption)
}
handler.help = ["rekap"]
handler.tags = ["tools"]
handler.command = /^(rekap)$/i
export default handler

function parseStringToJson(input) {
  // Split the string into sections
  const sections = input.split(/\n\n+/)

  let result = []

  // Process each section
  sections.forEach(section => {
    const lines = section.split('\n')
    const mainKey = lines[0].split(':')[0].trim()
    
    let entries = {}

    lines.slice(1).forEach(line => {
      // Use regular expression to capture the name and value
      const match = line.match(/^(.+?)\s+(\d+)/)
      if (match) {
        const name = match[1].trim()
        const numericValue = parseInt(match[2], 10)
        entries[name] = numericValue
      }
    })

    if (Object.keys(entries).length > 0) {
      result.push({ [mainKey]: entries })
    }
  })

  return result
}

function processData(data) {
    // Fungsi untuk menghitung total poin dan format string
    function calculateAndFormat(name, scores) {
        const scoreValues = Object.values(scores)
        const total = scoreValues.reduce((sum, score) => sum + score, 0)
        return `${name}: [${scoreValues.join(", ")}] = ${total}`
    }

    // Ambil nama dan poin dari data JSON
    const result1 = calculateAndFormat(Object.keys(data[0])[0], data[0][Object.keys(data[0])[0]])
    const result2 = calculateAndFormat(Object.keys(data[1])[0], data[1][Object.keys(data[1])[0]])

    // Hitung selisih
    const total1 = Object.values(data[0][Object.keys(data[0])[0]]).reduce((sum, score) => sum + score, 0)
    const total2 = Object.values(data[1][Object.keys(data[1])[0]]).reduce((sum, score) => sum + score, 0)
    const difference = Math.abs(total1 - total2)

    // Hasil akhir
    return `${result1}\n${result2}\n\nTOTAL: ${total1 + total2} \nSELISIH: ${difference}`
}