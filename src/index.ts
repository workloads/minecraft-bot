import { Movements, pathfinder } from 'mineflayer-pathfinder'
import { plugin as autoEat } from 'mineflayer-auto-eat'
import { plugin as tool } from 'mineflayer-tool'
import { MineflayerBot } from './core/bot'
import { configDotenv } from 'dotenv'

import mineflayer from 'mineflayer'
configDotenv()

// eslint-disable-next-line @typescript-eslint/no-var-requires
const inventoryView = require('mineflayer-web-inventory')

function createBot(): {
  instance: MineflayerBot
  bot: mineflayer.Bot
} {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const strings = require(`../locales/${[process.env.BOT_LANG]}.json`)
  const instance = new MineflayerBot(strings)
  const bot = instance.getBot()

  inventoryView(bot, { port: instance.getSettings().inventoryPort, log: false })
  instance.logger.info(
    strings.msg_interface_inventory_success,
    instance.getSettings().inventoryPort,
  )

  return { instance, bot }
}

export const { instance, bot } = createBot()

bot.loadPlugin(pathfinder)
bot.loadPlugin(autoEat)
bot.loadPlugin(tool)

bot.once('spawn', async () => {
  bot.autoEat.options.priority = instance.getSettings().hungerPriority
  bot.autoEat.options.startAt = instance.getSettings().hungerLimit
  bot.autoEat.options.bannedFood = instance.getSettings().hungerBannedFood

  bot.pathfinder.setMovements(new Movements(bot))

  bot.pathfinder.movements.allow1by1towers = false
  bot.pathfinder.movements.allowParkour = false
  bot.pathfinder.movements.canDig = false

  instance.logger.info(instance.strings.msg_plugins_success)
})

bot.on('death', async () => {
  instance.clearStates()
  instance.clearEvents()
})

bot.on('error', async (error: unknown) => {
  console.error(error)
})

bot.on('kicked', async (reason: string) => {
  instance.log(reason)
  process.exit(4)
})
