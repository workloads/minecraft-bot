/* eslint-disable @typescript-eslint/no-var-requires */
import { Movements, pathfinder } from 'mineflayer-pathfinder'
import { plugin as autoEat } from 'mineflayer-auto-eat'
import { plugin as tool } from 'mineflayer-tool'
import { MineflayerBot } from './core/bot'
import { configDotenv } from 'dotenv'

import mineflayer from 'mineflayer'
configDotenv()

const inventoryView = require('mineflayer-web-inventory')

function createBot(): {
  instance: MineflayerBot
  bot: mineflayer.Bot
} {
  const strings = require(`../locales/${[process.env.BOT_LANG]}.json`)

  const instance = new MineflayerBot(strings)
  const bot = instance.getBot()

  inventoryView(bot, { port: instance.getSettings().inventoryPort, log: false })
  instance.log.info(strings.msg_interface_inventory_success, instance.getSettings().inventoryPort)

  return { instance, bot }
}

export const { instance, bot } = createBot()

bot.once('spawn', async () => {
  bot.loadPlugin(pathfinder)
  bot.loadPlugin(autoEat)
  bot.loadPlugin(tool)

  bot.autoEat.options.priority = instance.getSettings().hungerPriority
  bot.autoEat.options.startAt = instance.getSettings().hungerLimit
  bot.autoEat.options.bannedFood = instance.getSettings().hungerBannedFood

  bot.pathfinder.setMovements(new Movements(bot))

  bot.pathfinder.movements.allow1by1towers = false
  bot.pathfinder.movements.allowParkour = false
  bot.pathfinder.movements.canDig = false

  instance.log.info(instance.locale.msg_greetings)
})

bot.on('death', async () => {
  instance.clearStates()
  instance.clearEvents()
})

bot.on('error', async (error: unknown) => {
  console.error(error)
})

bot.on('kicked', async (reason: string) => {
  instance.log.info(reason)
  process.exit(4)
})