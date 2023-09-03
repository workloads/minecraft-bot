import type { Vec3 } from "vec3";

interface BotStates {
    isMining: boolean,
    stopMining: boolean,
    block: string | undefined
}

interface BotSettings {
    discordToken: string | undefined,
    discordChannel: string | undefined,
    inventoryPort: number | undefined,
    viewPort: number | undefined,
    interfacePort: number | undefined,

    hungerPriority: "saturation" | "foodPoints",
    hungerLimit: number,
    hungerBannedFood: string[],
    
    miningEnabled: boolean,
    miningBlock: string | undefined,
    miningDistance: number,
    miningChest: Vec3,

    operators: string[] | string,
    commandsEnabled: boolean,
    commandsPrefix: string,

    mappedBlocks: string[] | string
}

export { BotStates, BotSettings };