import mineflayer, { BotEvents } from 'mineflayer'
import { instance } from '../../index'
import { goals } from 'mineflayer-pathfinder'

/**
 * @param {mineflayer.Bot} bot
 */

module.exports = (bot: mineflayer.Bot) => {
  bot.addChatPattern(
    'come',
    new RegExp(`<(.*)> ${instance.getSettings().commandsPrefix}(come|come to me)`),
    { repeat: true, parse: true },
  )

  bot.on('chat:come' as keyof BotEvents, ([[username]]: [string]): void => {
    if (!instance.getSettings().commandsEnabled) return

    if (!instance.getSettings().operators.includes(username)) return
    instance.reportToDiscord(username, 'come')

    const player = bot.players[username]

    if (!player) {
      instance.logger.error('The bot cannot see you, please check your render distance.')
      return
    }

    const pos = player.entity.position

    bot.pathfinder.setGoal(new goals.GoalNear(pos.x, pos.y, pos.z, 2))
  })
}
