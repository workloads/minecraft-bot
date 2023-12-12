import { MineflayerBot } from '../core/bot'
import { Args } from '../interfaces'
import MinecraftData from 'minecraft-data'

async function attempt_attack(instance: MineflayerBot, args: Args): Promise<void> {
  if (instance.getStates().block) return

  const entity = args.argument

  if (!entity) return

  const mcData = MinecraftData(instance.getBot().version)

  const desired = mcData.entitiesByName[entity.toLowerCase().replace(' ', '_')]

  if (!desired) {
    instance.log.info(instance.locale.bot_search_mob_fail, entity)
    return
  }

  instance.log.info('[BOT:attack] attacking `%s`', desired.displayName)

  instance.getStates().entity = entity.toLowerCase()

  for (const item of instance.getBot().inventory.items()) {
    if (item.displayName.includes('Sword')) {
      instance.getBot().equip(item, null)
    }
  }

  await attack(instance)
}

async function attack(instance: MineflayerBot): Promise<void> {
  if (instance.getStates().stopMurdering) {
    stop_attack(instance)
    return
  }

  const entity = instance.getBot().nearestEntity((entity) => {
    if (entity.name) {
      return entity.name.toLowerCase() === instance.getStates().entity
    }
    return false
  })
  if (!entity) {
    stop_attack(instance)
    return
  }

  instance.getBot().pvp.attack(entity)

  instance.getBot().on('entityDead', async (dead) => {
    if (dead.id !== entity.id) return
    instance.getBot().pvp.forceStop()
    instance.getBot().removeAllListeners('entityDead')

    await instance.getBot().waitForTicks(20)
    attack(instance)
  })
}

async function stop_attack(instance: MineflayerBot): Promise<void> {
  instance.getStates().stopMurdering = false
  instance.getStates().entity = undefined
  instance.clearEvents()
}

export { attempt_attack as attempt_attack, stop_attack }
