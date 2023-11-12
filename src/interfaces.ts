import type { Vec3 } from 'vec3'

interface BotStates {
  isMining: boolean
  stopMining: boolean
  stopMurdering: boolean
  block: string | undefined
  entity: string | undefined
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
  mappedLogs: string[] | string
}

interface Strings {
  bot_greeting: string
  api_message_received: string
  api_interface_start: string
  api_interface_fail: string
  api_command_sent: string
  discord_token_fail_notfound: string
  discord_token_success: string
  msg_discord_token_not_present: string
  msg_discord_token_failure: string
  msg_discord_token_success: string
  msg_discord_request_channel_id: string
  msg_discord_channel_success: string
  msg_discord_channel_failure: string
  env_config_load_fail: string
  env_config_load_success: string
  bot_search_block_success: string
  bot_search_block_fail: string
  bot_search_chest_success: string
  bot_search_chest_fail: string
  bot_search_player_success: string
  bot_search_player_fail: string
  bot_search_bed_success: string
  bot_search_bed_fail: string
  bot_mine_start: string
  bot_mine_fail_start: string
  bot_mine_stop: string
  bot_deposit_start: string
  bot_deposit_success: string
  bot_deposit_fail: string
  bot_mine_inprogress: string
  inventoryviewer_interface_success: string
  inventoryviewer_interface_fail: string
  plugins_success: string
  plugins_fail: string
  bot_command_fail: string
  bot_command_success: string
  bot_command_fail_notfound: string
  bot_command_fail_unauthorized: string
  bot_command_fail_denylisted: string
  bot_sleep_start: string
  bot_sleep_fail: string
  bot_sleep_success: string
  bot_sleep_fail_day: string
  bot_sleep_fail_monsters: string
  bot_sleep_inprogress: string
  discord_embed_title: string
  discord_embed_author_text: string
  discord_embed_description_title: string
  discord_embed_description_self_label: string
  discord_discord_embed_description_commander: string
  discord_embed_description_command: string
}

export { BotStates, BotSettings, Strings, Args }
