import { MineflayerBot } from './core/bot'
import mineflayer from 'mineflayer'

import { Movements, pathfinder } from 'mineflayer-pathfinder'
import { plugin as autoEat } from 'mineflayer-auto-eat'
import { plugin as tool } from 'mineflayer-tool'
import Fastify, { FastifyInstance } from 'fastify'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const inventoryView = require('mineflayer-web-inventory')

function createBot(): {
  instance: MineflayerBot
  bot: mineflayer.Bot
  fastify: FastifyInstance
} {
  const instance = new MineflayerBot()
  const bot = instance.getBot()
  const fastify = Fastify()

  inventoryView(bot, { port: instance.getSettings().inventoryPort, log: false })
  instance.logger.info(
    'Inventory viewer is up and listening to port: %d',
    instance.getSettings().inventoryPort,
  )

  return { instance, bot, fastify }
}

export const { instance, bot, fastify } = createBot()

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

  instance.logger.info(`Plugins has been configured. Currently at ${bot.entity.position.floor()}`)
})

bot.on('death', async () => {
  instance.clearStates()
  instance.clearEvents()
})

bot.on('error', async (error) => {
  console.error(error)
})

bot.on('kicked', async (reason) => {
  instance.logger.info(reason)
  process.exit(4)
})
