import { MineflayerBot } from '../core/bot'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FindBed(instance: MineflayerBot): any {
  const block = instance.getBot().findBlock({
    maxDistance: instance.getSettings().miningDistance,
    matching: (bed) => {
      if (bed.displayName.includes('Bed') && !bed.displayName.includes('Bedrock')) {
        // if (bed.)
        if (bed.getProperties().occupied) {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function findDesiredBlock(instance: MineflayerBot): Promise<any> {
  return await instance.getBot().findBlock({
    matching: (b) => b.name === instance.getStates().block,
    maxDistance: instance.getSettings().miningDistance,
  })
}

export { FindBed, findDesiredBlock }
