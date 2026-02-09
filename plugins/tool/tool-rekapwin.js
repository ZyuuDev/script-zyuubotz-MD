let handler = async (m, { conn, usedPrefix, command, text }) => {
    text = m.quoted ? m.quoted.text : text
    if (!text) return m.reply(`
Masukan Data Yang Ingin Direkap!

Contoh:

Laga = Tugu Wismana

RyHar Team:
Ry 67
Bayu 51
Fajri 916

Barudak Team:
Gororo 92
Matasi 816
Guara 826
`.trim())
    text = text.replace(/🤖/gi, '').replace(/👾/gi, '')
    let result = formatText(text)
    m.reply(result)
}
handler.help = ["rekapwin"]
handler.tags = ["tools"]
handler.command = /^(rekapwin)$/i
export default handler

const formatText = (input) => {
    // Split the input into paragraphs using double newlines
    const paragraphs = input.split('\n\n')

    // Ignore the last paragraph
    const relevantParagraphs = paragraphs.slice(0, -1)

    // Process each line within the relevant paragraphs
    const formattedParagraphs = relevantParagraphs.map(paragraph => {
        const lines = paragraph.split('\n')
        const formattedLines = lines.map(line => {
            // Skip lines containing a colon or specific text markers
            if (line.includes(':')) {
                return line
            }

            // Check if the line contains a number and possibly a parenthesized value
            const match = line.match(/(\d+)(?: \((LF \d+)\))?/)
            if (match) {
                const number = parseInt(match[1], 10)
                const lfNumber = match[2] ? parseInt(match[2].match(/\d+/)[0], 10): null
                let result,
                lfResult

                // Apply different calculations based on the presence of "LF"
                if (lfNumber !== null) {
                    // Multiply the main number by 2 and reduce by 6%
                    result = Math.round((number * 2) - (number * 2 * 0.06))
                    // Reduce the LF number by 6%
                    lfResult = Math.round(lfNumber * 0.6)
                } else if (line.toUpperCase().includes('LF')) {
                    // If only "LF" is present, reduce by 6%
                    result = Math.round(number * 0.6)
                } else {
                    // Otherwise, multiply by 2 and reduce by 6%
                    result = Math.round((number * 2) - (number * 2 * 0.06))
                }

                // Format the line with the calculated results
                if (lfNumber !== null) {
                    return line.replace(`${number} (LF ${lfNumber})`, `${number} (LF ${lfNumber}) 🤖 ${result} (LF ${lfResult})`)
                } else {
                    return line.replace(`${number}`, `${number} 🤖 ${result}`)
                }
            }
            return line // Return the line unchanged if no number is found
        })

        // Join the formatted lines back into a paragraph
        return formattedLines.join('\n')
    })

    // Join the formatted paragraphs back together and add the ignored paragraph unchanged
    return [...formattedParagraphs, paragraphs[paragraphs.length - 1]].join('\n\n')
}