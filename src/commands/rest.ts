import { MineflayerBot } from '../core/bot'
import { goals } from 'mineflayer-pathfinder'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function find_desired_bed(instance: MineflayerBot): any {
    const block = instance.getBot().findBlock({
      maxDistance: instance.getSettings().miningDistance,
      matching: (bed) => {
        if (bed.displayName.includes('Bed') && !bed.displayName.includes('Bedrock')) {
          if (!bed.getProperties().occupied) {
            return true
          }
          return false
        }
        return false
      },
    })
  
    if (block) {
      return block
    } else {
      return undefined
    }
  }

async function sleep(instance: MineflayerBot): Promise<void> {
    if (instance.getBot().time.isDay) {
        instance.log(instance.strings.msg_sleeper_day)
        return
    }

    const bed = find_desired_bed(instance)

    if (!bed) {
        instance.log(instance.strings.msg_sleeper_failure)
        return
    }

    instance.getBot().pathfinder.setGoal(null)

    instance.getBot().pathfinder.setGoal(
        new goals.GoalGetToBlock(bed.position.x, bed.position.y, bed.position.z)
    )

    instance.getBot().once('goal_reached', async () => {
        instance.getBot().sleep(bed).catch((reason) => {
            if (reason.message.includes('monsters nearby')) {
              instance.log(instance.strings.msg_sleeper_monsters)
            }
          })
    })
}

async function wake(instance: MineflayerBot): Promise<void> {
    if (instance.getBot().isSleeping) {
        instance.getBot().wake()
      }
}

export { sleep, wake }