import chalk from "chalk"
import { makeChild, stopChild } from "./jadibot.js"

async function connectJadibot(isSendMessage = true) {
  try {
    if (global.db?.data == null) {
      await global.loadDatabase()
    }

    if (!global.db?.data?.bots) {
      console.log(chalk.yellow("⚠️ Database bots tidak tersedia, skip reconnect jadibot"))
      return
    }

    const bot = global.db.data.bots
    if (!bot.jadibot) bot.jadibot = {}

    const jadibot = bot.jadibot
    const now = Date.now()

    const activeBots = Object.keys(jadibot).filter((id) => {
      const botData = jadibot[id]

      if (!botData?.aktif) return false

      const expiredAt = botData.expiredAt || 0
      if (expiredAt && expiredAt <= now) {
        console.log(chalk.yellow(`⏰ Jadibot ${id} sudah expired, akan dihapus`))
        return true
      }

      return true
    })

    if (!activeBots || activeBots.length === 0) {
      console.log(chalk.cyan("ℹ️ Tidak ada jadibot aktif untuk disambungkan"))
      return
    }

    console.log(chalk.cyan(`\n🔄 Menyambungkan ${activeBots.length} jadibot...\n`))

    let successCount = 0
    let failedCount = 0
    let expiredCount = 0

    for (const id of activeBots) {
      try {
        const botData = jadibot[id]

        const expiredAt = botData.expiredAt || 0
        if (expiredAt && expiredAt <= now) {
          console.log(chalk.red(`❌ [${id}] Masa aktif telah berakhir`))
          await stopChild(id, "expired")
          expiredCount++
          continue
        }

        console.log(chalk.blue(`⏳ [${id}] Membuka koneksi...`))

        const child = await makeChild(id)

        if (!child?.__already && !child?.user?.id) {
          console.log(chalk.red(`❌ [${id}] Gagal tersambung, sesi tidak valid`))

          botData.aktif = false
          botData.lastFailedAt = now

          failedCount++
          continue
        }

        botData.aktif = true
        botData.lastConnectedAt = now
        botData.connectedSince = now

        try {
          if (isSendMessage) {
            const ownerJid = botData.owner
            await global.conn?.reply(ownerJid, `✅ *Jadibot Tersambung*\n\n🤖 Bot ID: ${child.user?.id}\n📅 Expired: ${expiredAt ? new Date(expiredAt).toLocaleString("id-ID") : "∞"}\n\n_Bot siap digunakan_`)
          }
        } catch (notifError) {
          console.log(chalk.yellow(`⚠️ [${id}] Gagal kirim notifikasi ke owner: ${notifError.message}`))
        }

        console.log(chalk.green(`✅ [${id}] Tersambung sebagai ${child.user?.id}`))
        successCount++

        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(chalk.red(`❌ [${id}] Error: ${error.message}`))

        if (jadibot[id]) {
          jadibot[id].aktif = false
          jadibot[id].lastErrorAt = now
          jadibot[id].lastError = error.message
        }

        failedCount++
      }
    }
  } catch (error) {
    console.error(chalk.red("❌ Error pada connectJadibot:"), error)
  }
}

export { connectJadibot }
