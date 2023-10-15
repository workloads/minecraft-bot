import mineflayer, { BotEvents } from 'mineflayer'
import { instance } from '../../index'
import { createRaw } from '../../utils/message'

/**
 * @param {mineflayer.Bot} bot
 */

module.exports = (bot: mineflayer.Bot) => {
  bot.addChatPattern(
    'status',
    new RegExp(`<(.*)> ${instance.getSettings().commandsPrefix}status`),
    { repeat: true, parse: true },
  )

  const mapped_tools = ['axe', 'pickaxe', 'shovel', 'hoe', 'sword']

  bot.on('chat:status' as keyof BotEvents, async ([[username]]: string) => {
    if (!instance.getSettings().commandsEnabled) return

    if (!instance.getSettings().operators.includes(username)) return
    instance.sendToDiscord(`status command was executed by ${username}.`)

    const tools = []

    for (const item of bot.inventory.items()) {
      for (const tool of mapped_tools) {
        if (item.name.includes(tool)) {
          tools.push(item.displayName)
        }
      }
    }

    const hungerc =
      bot.food > 15 ? '§a' : bot.food <= 15 && bot.food > 9 ? '§6' : bot.food < 9 ? '§c' : null
    const healthc =
      bot.health > 15
        ? '§a'
        : bot.health <= 15 && bot.health > 9
        ? '§6'
        : bot.health < 9
        ? '§c'
        : null

    const pos = bot.entity.position.floor()

    const messages = [
      '',
      createRaw('--------------stats--------------', 'blue', true, true),
      createRaw('Bot username: '),
      createRaw(`${bot.username}`, 'red', true, true),
      createRaw(`Bot dimension: ${bot.game.dimension}`),
      createRaw(`Bot hunger: ${hungerc}${bot.food}/20`),
      createRaw(`Bot health: ${healthc}${bot.health}/20`),
      createRaw(`Bot location: ${pos.x} ${pos.y} ${pos.z}`),
      createRaw('--------------Tools--------------', 'blue', true, true),
    ]

    for (const tool of tools) {
      messages.push(createRaw(tool))
    }

    for (const message of messages) {
      bot.chat(`/tellraw @a ${JSON.stringify([message])}`)
    }
  })
}
