import mineflayer, { BotEvents } from 'mineflayer'

import { createRaw } from '../../functions/message'
import { instance } from '../../index'

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
    instance.reportToDiscord(username, 'status')

    const tools = []

    for (const item of bot.inventory.items()) {
      for (const tool of mapped_tools) {
        if (item.name.includes(tool)) {
          tools.push(item.displayName)
        }
      }
    }

    const hunger_extra = { text: `${bot.food}/20`, color: 'white' }
    const health_extra = { text: `${bot.health}/20`, color: 'white' }

    hunger_extra.color =
      bot.food > 15
        ? 'green'
        : bot.food <= 15 && bot.food > 9
        ? 'yellow'
        : bot.food < 9
        ? 'red'
        : 'white'

    health_extra.color =
      bot.health > 15
        ? 'green'
        : bot.health <= 15 && bot.health > 9
        ? 'yellow'
        : bot.health < 9
        ? 'red'
        : 'white'

    const pos = bot.entity.position.floor()

    const messages = [
      '',
      createRaw('--------------Stats--------------', 'blue', true, true),
      createRaw('Bot username: '),
      createRaw(`${bot.username}`, 'red', true, true),
      createRaw(`Bot dimension: ${bot.game.dimension}`),
      createRaw('Bot hunger: ', 'white', false, false, hunger_extra),
      createRaw('Bot health: ', 'white', false, false, health_extra),
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
