export async function before(m, { senderKey }) {
  if (!/lid|@s.whatsapp.net/.test(senderKey)) return
  if (m.fromMe) return
  let user = global.db.data.users[senderKey]
  if (!user) return
  if (user.historyTrx.length < 0) return
  let totalSpend = user.historyTrx.reduce((a, c) => {
    return a + Number(c.nominal)
  }, 0)
  const userRank = rankList.find((v) => totalSpend >= v.min && totalSpend < v.max)
  user.rank = userRank.rank
  return
}
const rankList = [
  { min: 0, max: 500000, rank: "Bronze" },
  { min: 500000, max: 1000000, rank: "Elite" },
  { min: 1000000, max: 1500000, rank: "Gold" },
  { min: 1500000, max: 100000000, rank: "Master" },
]
