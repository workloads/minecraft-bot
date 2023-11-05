import { goals } from 'mineflayer-pathfinder'
import { MineflayerBot } from '../core/bot'
import { Args } from '../interfaces'

async function attempt_mining(instance: MineflayerBot, args: Args): Promise<void> {
  let block = args.argument

  if (!block) return

  block = block.toLowerCase().replaceAll(' ', '_')

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mcData = require('minecraft-data')(instance.getBot().version)

  if (instance.getStates().isMining) {
    instance.log.info(instance.locale.msg_miner_already_started)
    return
  }

  if (instance.getSettings().mappedBlocks.includes(block)) {
    block = block + '_block'
  }

  if (!mcData.blocksByName[block]) {
    instance.log.info(instance.locale.msg_finder_block_failure, block)
    return
  }

  instance.getStates().block = block.toLowerCase().replaceAll(' ', '_')

  const desired = await find_desired_block(instance)

  if (!desired) {
    instance.log.info(instance.locale.msg_finder_block_failure, block)
    return
  }

  instance.log.info(instance.locale.msg_miner_start_success)

  instance.getStates().isMining = true

  await instance.getBot().tool.equipForBlock(desired)

  await mining(instance)
}

async function stop_mining(instance: MineflayerBot): Promise<void> {
  instance.getStates().stopMining = true
  instance.getStates().isMining = false
  instance.getStates().block = undefined
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function find_desired_block(instance: MineflayerBot): Promise<any> {
  return instance.getBot().findBlock({
    matching: (b) => b.name === instance.getStates().block,
    maxDistance: instance.getSettings().miningDistance
  })
}

async function mining(instance: MineflayerBot): Promise<void> {
  const bot = instance.getBot()

  if (instance.getStates().stopMining) {
    instance.getStates().stopMining = false

    instance.log.info(instance.locale.msg_miner_stopped)
    return
  }

  if (bot.inventory.emptySlotCount() <= 1) {
    instance.log.info(instance.locale.msg_miner_deposit_start)

    await deposit(instance, true)
    return
  }

  const desired = await find_desired_block(instance)

  if (!desired) {
    instance.log.info(
      instance.locale.msg_finder_block_failure,
      instance.getStates().block?.replace('_', ' '),
    )
    instance.getStates().isMining = false
    instance.getStates().stopMining = false
    await deposit(instance, false)
    return
  }

  bot.pathfinder.setGoal(
    new goals.GoalNear(desired.position.x, bot.entity.position.y, desired.position.z, 2),
  )

  bot.once('goal_reached', async () => {
    bot.dig(desired, true)

    bot.once('diggingCompleted', async (block: { position: { x: number; z: number } }) => {
      bot.pathfinder.setGoal(
        new goals.GoalNear(block.position.x, bot.entity.position.y, block.position.z, 1),
      )
      await bot.waitForTicks(3)
      instance.clearEvents()
      await mining(instance)
    })
  })
}

async function deposit(instance: MineflayerBot, retry = false): Promise<void> {
  const bot = instance.getBot()

  const goal = new goals.GoalGetToBlock(
    instance.getSettings().miningChest.x,
    instance.getSettings().miningChest.y,
    instance.getSettings().miningChest.z,
  )

  bot.pathfinder.setGoal(goal)

  bot.once('goal_reached', async () => {
    const chest = bot.findBlock({
      matching: (block) => block.position.equals(instance.getSettings().miningChest),
      useExtraInfo: true,
    })

    if (chest !== null) {
      if (chest.name === 'chest' || chest.name === 'barrel') {
        const openChest = await bot.openChest(chest)

        for (const item of bot.inventory.items()) {
          if (item.name === instance.getStates().block) {
            await openChest.deposit(item.type, null, item.count)
            await bot.waitForTicks(10)
          }
        }

        openChest.close()

        instance.log.info(instance.locale.msg_miner_deposit_start)

        if (retry) {
          await mining(instance)
        }
      } else {
        instance.log.error(`\x1b[41m${instance.locale.msg_finder_chest_failure}\x1b[0m`)
      }
    }
  })
}

export { attempt_mining, stop_mining }