import mineflayer from 'mineflayer'
import { instance } from '../index'

import { sleep, wake } from '../commands/sleep'
import { attempt_mining, stop_mining } from '../commands/mine'
import { MineflayerBot } from './bot'
import { go_to_player } from '../commands/move'
import { Args } from '../interfaces'
import { halt, status_request } from '../commands/health'
import { attempt_attack, stop_attack } from '../commands/attack'

const commands: { [key in string]: (instance: MineflayerBot, argument: Args) => Promise<void> } = {
  sleep: sleep,
  wake: wake,
  mine: attempt_mining,
  stop_mining: stop_mining,
  stop_attacking: stop_attack,
  attack: attempt_attack,
  come: go_to_player,
  status: status_request,
  quit: halt,
}

function command_handler(bot: mineflayer.Bot) {
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
    // eslint-disable-next-line no-prototype-builtins
    if (!commands.hasOwnProperty(command)) {
      instance.log.info(instance.locale.bot_command_fail, command)
      return
    }

    const commanded = match[2]
    const argument = match[3] || undefined

    const args: Args = {
      username: username,
      argument: argument,
    }

    if (commanded === bot.username) {
      instance.send_to_discord(username, `${command} ${argument ? argument : ''}`)
      commands[command](instance, args)
      return
    }

    const parsed_commanded = commanded.split('-')
    const parsed_username = bot.username.split('-')

    let count = 0
    for (const segment of parsed_commanded) {
      if (segment === '*') {
        instance.send_to_discord(username, `${command} ${argument ? argument : ''}`)
        commands[command](instance, args)
        return
      }

      if (segment === parsed_username[count]) {
        count++
        continue
      }
      return
    }
  })
}

export { commands, command_handler }
