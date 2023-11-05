import { goals } from 'mineflayer-pathfinder'
import { MineflayerBot } from '../core/bot'
import { Args } from '../interfaces'

async function go_to_player(instance: MineflayerBot, args: Args): Promise<void> {
  const player = instance.getBot().players[args.username]

  if (!player) {
    instance.log.error(instance.locale.msg_finder_player_failure)
    return
  }

  const pos = player.entity.position

  instance.getBot().pathfinder.setGoal(new goals.GoalNear(pos.x, pos.y, pos.z, 2))
}

export { go_to_player }
