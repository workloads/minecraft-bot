import type { Vec3 } from 'vec3'

interface BotStates {
  isMining: boolean
  stopMining: boolean
  block: string | undefined
}

interface Args {
  username: string
  argument: string | undefined
}

interface BotSettings {
  discordToken: string | undefined
  discordChannel: string | undefined
  discordEmbedColor: string
  inventoryPort: number | undefined
  viewPort: number | undefined
  interfacePort: number | undefined

  hungerPriority: 'saturation' | 'foodPoints'
  hungerLimit: number
  hungerBannedFood: string[]

  miningEnabled: boolean
  miningBlock: string | undefined
  miningDistance: number
  miningChest: Vec3

  operators: string[] | string
  commandsEnabled: boolean
  commandsPrefix: string

  mappedBlocks: string[] | string
}

interface Strings {
  msg_greetings: string
  msg_api_received: string
  msg_api_success: string
  msg_api_failure: string
  msg_api_sent: string
  msg_discord_failure: string
  msg_discord_success: string
  msg_discord_token_not_present: string
  msg_discord_token_failure: string
  msg_discord_token_success: string
  msg_discord_request_channel_id: string
  msg_discord_channel_success: string
  msg_discord_channel_failure: string
  msg_env_failure: string
  msg_env_success: string
  msg_credentials_success: string
  msg_credentials_failure: string
  msg_finder_block_success: string
  msg_finder_block_failure: string
  msg_finder_chest_success: string
  msg_finder_chest_failure: string
  msg_finder_player_success: string
  msg_finder_player_failure: string
  msg_finder_bed_success: string
  msg_finder_bed_failure: string
  msg_miner_start_success: string
  msg_miner_start_failure: string
  msg_miner_stopped: string
  msg_miner_deposit_start: string
  msg_miner_deposit_success: string
  msg_miner_deposit_failure: string
  msg_miner_already_started: string
  msg_interface_inventory_success: string
  msg_interface_inventory_failure: string
  msg_plugins_success: string
  msg_plugins_failure: string
  msg_command_failure: string
  msg_command_success: string
  msg_command_notfound: string
  msg_command_unauthorized: string
  msg_command_blacklisted: string
  msg_sleeper_commence: string
  msg_sleeper_failure: string
  msg_sleeper_success: string
  msg_sleeper_day: string
  msg_sleeper_monsters: string
  msg_sleeper_sleeping: string
  embed_title: string
  embed_author_text: string
  embed_description_title: string
  embed_description_self_label: string
  embed_description_commander: string
  embed_description_command: string
}

export { BotStates, BotSettings, Strings, Args }
