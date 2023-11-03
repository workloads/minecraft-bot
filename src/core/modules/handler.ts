import mineflayer from 'mineflayer'
import { instance } from '../../index'

/**
 * @param {mineflayer.Bot} bot
 */

module.exports = (bot: mineflayer.Bot) => {




  bot.on('chat', (username, message) => {
    if (
      !instance.getSettings().commandsEnabled ||
      !instance.getSettings().operators.includes(username) ||
      !message.startsWith(instance.getSettings().commandsPrefix)
    )
      return

    const regex = /#(.*?) (\S+)(?: (\S+))?/
    const match = message.match(regex)

    if (match === null) return

    const command = match[1]
    const commanded = match[2]
    const argument = match[3] || undefined

    if (commanded === bot.username) {
      instance.reportToDiscord('TEST', `${command} ${argument}`)
      return
    }

    const parsed_commanded = commanded.split('-')
    const parsed_username = bot.username.split('-')

    console.log(parsed_commanded, parsed_username)

    let count = 0
    for (const segment of parsed_commanded) {
      console.log(segment)
      if (segment === '*') {
        instance.reportToDiscord('TEST', `${command} ${argument ? argument : ''}`)
        return
      }

      if (segment === parsed_username[count]) {
        count++
        continue
      }

      instance.logger.info('I was not commanded.')
      return
    }

    instance.logger.info(parsed_commanded)
  })
}
