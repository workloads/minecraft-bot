import { MineflayerBot } from '../core/bot'
import { Args } from '../interfaces'
import MinecraftData from 'minecraft-data'

async function attempt_murder(instance: MineflayerBot, args: Args): Promise<void> {
  if (instance.getStates().block) return

  const entity = args.argument

  if (!entity) return

  const mcData = MinecraftData(instance.getBot().version)

  const desired = mcData.entitiesByName[entity.toLowerCase().replace(' ', '_')]

  if (!desired) {
    instance.log.info('was not able to find %s', entity)
    return
  }

  instance.log.info('I was commanded to murder %s', desired.displayName)

  instance.getStates().entity = entity.toLowerCase()

  for (const item of instance.getBot().inventory.items()) {
    if (item.displayName.includes('Sword')) {
      instance.getBot().equip(item, null)
    }
  }

  await murder(instance)
}

async function murder(instance: MineflayerBot): Promise<void> {
  if (instance.getStates().stopMurdering) {
    stop_murdering(instance)
    return
  }

  const entity = instance.getBot().nearestEntity((entity) => {
    if (entity.name) {
      return entity.name.toLowerCase() === instance.getStates().entity
    }
    return false
  })
  if (!entity) {
    stop_murdering(instance)
    return
  }

  instance.getBot().pvp.attack(entity)

  instance.getBot().on('entityDead', async (dead) => {
    if (dead.id !== entity.id) return
    instance.getBot().pvp.forceStop()
    instance.getBot().removeAllListeners('entityDead')

    await instance.getBot().waitForTicks(20)
    murder(instance)
  })
}

async function stop_murdering(instance: MineflayerBot): Promise<void> {
  instance.getStates().stopMurdering = false
  instance.getStates().entity = undefined
  instance.clearEvents()
}

export { attempt_murder, stop_murdering }