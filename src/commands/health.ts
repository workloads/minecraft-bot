import { MineflayerBot } from '../core/bot'

const mapped_tools = ['axe', 'pickaxe', 'shovel', 'hoe', 'sword']

function createRaw(
  message: string,
  color = 'white',
  italic = false,
  bold = false,
  extra: null | { color: string } = null,
) {
  return {
    text: message,
    color: color,
    italic: italic,
    bold: bold,
    extra: extra === null ? [{ text: '', color: 'white' }] : [extra],
  }
}

async function halt(): Promise<void> {
  process.exit(4)
}

async function status_request(instance: MineflayerBot): Promise<void> {
  const tools = []

  for (const item of instance.getBot().inventory.items()) {
    for (const tool of mapped_tools) {
      if (item.name.includes(tool)) {
        tools.push(item.displayName)
      }
    }
  }

  const hunger_extra = { text: `${instance.getBot().food}/20`, color: 'white' }
  const health_extra = { text: `${instance.getBot().health}/20`, color: 'white' }

  hunger_extra.color =
    instance.getBot().food > 15
      ? 'green'
      : instance.getBot().food <= 15 && instance.getBot().food > 9
      ? 'yellow'
      : instance.getBot().food < 9
      ? 'red'
      : 'white'

  health_extra.color =
    instance.getBot().health > 15
      ? 'green'
      : instance.getBot().health <= 15 && instance.getBot().health > 9
      ? 'yellow'
      : instance.getBot().health < 9
      ? 'red'
      : 'white'

  const pos = instance.getBot().entity.position.floor()

  const messages = [
    '',
    createRaw('--------------Stats--------------', 'blue', true, true),
    createRaw('Bot username: '),
    createRaw(`${instance.getBot().username}`, 'red', true, true),
    createRaw(`Bot dimension: ${instance.getBot().game.dimension}`),
    createRaw('Bot hunger: ', 'white', false, false, hunger_extra),
    createRaw('Bot health: ', 'white', false, false, health_extra),
    createRaw(`Bot location: ${pos.x} ${pos.y} ${pos.z}`),
    createRaw('--------------Tools--------------', 'blue', true, true),
  ]

  for (const tool of tools) {
    messages.push(createRaw(tool))
  }

  for (const message of messages) {
    instance.getBot().chat(`/tellraw @a ${JSON.stringify([message])}`)
  }
}

export { status_request, halt }
