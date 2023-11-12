/* eslint-disable @typescript-eslint/no-var-requires */
import { Movements, pathfinder } from 'mineflayer-pathfinder'
import { plugin as autoEat } from 'mineflayer-auto-eat'
import { plugin as tool } from 'mineflayer-tool'
import { plugin as pvp } from 'mineflayer-pvp'
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
  // see https://www.npmjs.com/package/mineflayer-pathfinder
  bot.loadPlugin(pathfinder)

  // see https://www.npmjs.com/package/mineflayer-auto-eat
  bot.loadPlugin(autoEat)

  // see https://www.npmjs.com/package/mineflayer-tool
  bot.loadPlugin(tool)

  // see https://www.npmjs.com/package/mineflayer-pvp
  bot.loadPlugin(pvp)

  // see https://www.npmjs.com/package/mineflayer-auto-eat#botautoeatoptionspriority
  bot.autoEat.options.priority = instance.getSettings().hungerPriority
  bot.autoEat.options.startAt = instance.getSettings().hungerLimit
  bot.autoEat.options.bannedFood = instance.getSettings().hungerBannedFood

  // see https://www.npmjs.com/package/mineflayer-pathfinder#movements
  bot.pathfinder.setMovements(new Movements(bot))

  // disable building of 1x1 blocks when moving upwards
  bot.pathfinder.movements.allow1by1towers = false

  // disable jumping over distances further than 1 block when moving
  bot.pathfinder.movements.allowParkour = false

  // disable breaking of blocks when moving
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
