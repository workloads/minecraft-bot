import mineflayer, { BotEvents } from 'mineflayer'

import { instance } from '../../index'

/**
 * @param {mineflayer.Bot} bot
 */

module.exports = (bot: mineflayer.Bot) => {
  if (instance.getSettings().miningEnabled) {
    bot.addChatPattern(
      'mine',
      new RegExp(`<(.*)> ${instance.getSettings().commandsPrefix}mine (.*)`),
      { repeat: true, parse: true },
    )
    bot.addChatPattern('stop', new RegExp(`<(.*)> ${instance.getSettings().commandsPrefix}stop`), {
      repeat: true,
      parse: true,
    })
  }

  bot.on('chat:mine' as keyof BotEvents, ([[username, block]]: string) => {
    if (!instance.getSettings().commandsEnabled) return

    if (instance.getSettings().operators.includes(username)) {
      instance.reportToDiscord(username, 'mine', block)

      instance.goMine(block)
    }
  })

  bot.on('chat:stop' as keyof BotEvents, ([[username]]: string) => {
    if (!instance.getSettings().commandsEnabled) return
    if (instance.getStates().isMining) {
      instance.getStates().stopMining = true
      instance.getStates().isMining = false
      instance.getStates().block = undefined

      instance.reportToDiscord(username, 'stop')
      return
    }
  })
}
