let handler = async (m, { senderKey, conn, user }) => {
    let history = user.historyTrx
    let accountCreated = formatTimestampToWIB(user.created)
    let transaksi = sumNominal(history)
    let lastTransaksi = history.length > 0 ? [...history].reverse()[0] : { type: 'N/A', nominal: 0 }
    let name = user.registered ? user.name : m.name

    let caption = `
Name : ${name}
Rank : ${user.rank}
UID : ${senderKey.split("@")[0]}
Email : ${user.email ? user.email : "Belum Terdaftar"}
Saldo : Rp ${toRupiah(user.deposit)}
Tanggal Pembuatan Akun : 
${accountCreated}

_Kami berkomitmen untuk menjaga kerahasiaan akun Anda dengan sangat baik dan memastikan informasi pribadi Anda tetap aman._
`.trim()
    if (m.isGroup) {
        await m.reply("Info Account Telah Dikirim ke Private Chat Anda")
        await conn.reply(senderKey, caption)
    } else {
        await conn.reply(senderKey, caption, m)
    }
}
handler.help = ["account"]
handler.tags = ["topup"]
handler.command = /^(acc(ount)?)$/i
export default handler

const toRupiah = number => parseInt(number).toLocaleString('id-ID')

function formatTimestampToWIB(timestamp) {
    const date = new Date(timestamp)
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
        timeZoneName: 'short'
    }
    return date.toLocaleString('id-ID', options)
}

function sumNominal(transactions) {
    return transactions.reduce((total, transaction) => {
        return total + Number(transaction.nominal);
    }, 0)
}