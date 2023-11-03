import mineflayer, { Bot } from 'mineflayer'

import { Channel, Client, GatewayIntentBits, EmbedBuilder } from 'discord.js'
import { BotSettings, BotStates, Strings } from '../interfaces'
import { ConfigManager } from './env'
import { configDotenv } from 'dotenv'
import { Vec3 } from 'vec3'

import pretty from 'pino-pretty'
import { Api } from './api'
import pino from 'pino'

import { command_handler } from './handler'

configDotenv()

const env = process.env

class MineflayerBot {
  private bot: Bot
  private settings: BotSettings
  private states: BotStates
  public logger
  private discord: Client
  public channel: Channel | undefined
  public strings: Strings
  public api: Api

  private createSettings(): BotSettings {
    return {
      discordToken: env.DISCORD_TOKEN ? env.DISCORD_TOKEN : undefined,
      discordChannel: env.DISCORD_CHANNEL_ID ? env.DISCORD_CHANNEL_ID : undefined,
      inventoryPort: env.BOT_WEB_INVENTORY_PORT ? parseInt(env.BOT_WEB_INVENTORY_PORT) : undefined,
      viewPort: env.BOT_WEB_VIEW_PORT ? parseInt(env.BOT_WEB_VIEW_PORT) : undefined,
      interfacePort: env.BOT_WEB_INTERFACE_PORT ? parseInt(env.BOT_WEB_INTERFACE_PORT) : undefined,

      hungerPriority: env.BOT_HUNGER_PRIORITY === 'foodpoints' ? 'foodPoints' : 'saturation',
      hungerLimit: env.BOT_HUNGER_THRESHOLD ? parseInt(env.BOT_HUNGER_THRESHOLD) : 10,
      hungerBannedFood: env.BOT_HUNGER_BANNED_FOODS ? env.BOT_HUNGER_BANNED_FOODS.split(',') : [],

      miningEnabled: env.BOT_MINING_ENABLED === 'true' ? true : false,
      miningBlock: env.BOT_MINING_INITIAL_BLOCK ? env.BOT_MINING_INITIAL_BLOCK : undefined,
      miningDistance: env.BOT_MINING_SEARCH_DISTANCE
        ? parseInt(env.BOT_MINING_SEARCH_DISTANCE)
        : 18,
      miningChest: new Vec3(0, 0, 0),

      operators: env.BOT_CHAT_OPERATOR_ALLOWLIST ? env.BOT_CHAT_OPERATOR_ALLOWLIST : [],
      commandsEnabled: env.BOT_CHAT_ALLOW_CHAT === 'true' ? true : false,
      commandsPrefix: env.BOT_CHAT_COMMAND_PREFIX ? env.BOT_CHAT_COMMAND_PREFIX : '#',

      mappedBlocks: env.BOT_MAPPED_BLOCKS ? env.BOT_MAPPED_BLOCKS.split(',') : [],
    }
  }

  private createStates(): BotStates {
    return {
      isMining: false,
      stopMining: false,
      block: undefined,
    }
  }

  public getBot(): Bot {
    return this.bot
  }
  public getDiscordClient(): Client {
    return this.discord
  }

  public getStates(): BotStates {
    return this.states
  }

  public getSettings(): BotSettings {
    return this.settings
  }

  public async reportToDiscord(
    username: string,
    command: string,
    params: string | null = null,
  ): Promise<void> {
    if (!this.channel) return

    if (!this.channel.isTextBased()) return // This will never happen.

    const embed = new EmbedBuilder()
      .setTitle('Mineflayer-based Excavation Assistant')
      .setColor(`#${env.DISCORD_EMBED_COLOR}`) // translates to `#2f3136`
      .setThumbnail(`https://mc-heads.net/avatar/${username}`)
      .setAuthor({
        iconURL: `https://mc-heads.net/avatar/${this.bot.username}`,
        name: 'Command Report',
      })
      .setTimestamp()

    embed.setDescription(
      `### Command has been issued.\n\`\`\`yml\n- Bot Username: ${
        this.bot.username
      }\n\n- Commander: ${username}\n\n- Command ran: ${command} ${params ? params : ''}\n\`\`\``,
    )

    await this.channel.send({ embeds: [embed] })
  }

  constructor(strings: Strings) {
    this.channel = undefined
    this.logger = pino(
      pretty({
        colorize: true,
        customPrettifiers: {
          time: (timestamp) => `\x1b[34m${timestamp}\x1b[0m`,
          pid: () => `\x1b[36m${process.env.BOT_NAME}\x1b[0m`,
        },
        levelFirst: true,
      }),
    )

    const credentials = new ConfigManager().readConfig(this)
    if (!credentials) {
      process.exit(4)
    }

    this.bot = mineflayer.createBot({
      username: credentials.username,
      host: credentials.host,
      port: credentials.port,
      auth: credentials.auth,
      password: credentials.password,
      version: credentials.version,
    })
    this.strings = strings

    this.discord = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageTyping],
    })
    this.discord.on('shardReady', () => {
      this.logger.info(strings.msg_discord_success)
      if (!this.settings.discordChannel) {
        this.logger.error(strings.msg_discord_request_channel_id)
        process.exit(0)
      }

      this.channel = this.discord.channels.cache.get(this.settings.discordChannel)
    })

    const chest = env.BOT_MINING_CHEST_LOCATION
      ? env.BOT_MINING_CHEST_LOCATION.split(',')
      : ['0', '0', '0']

    this.settings = this.createSettings()
    this.states = this.createStates()

    this.settings.miningChest.set(parseInt(chest[0]), parseInt(chest[1]), parseInt(chest[2]))

    this.bot.loadPlugin(command_handler)
    this.api = new Api(this)

    if (this.settings.discordToken === undefined) {
      this.logger.info(strings.msg_discord_token_not_present)
      return
    }

    this.discord.login(this.settings.discordToken).catch(() => {
      this.logger.error(strings.msg_discord_token_failure)
      return
    })
  }

  public clearStates(): void {
    this.settings = this.createSettings()
    this.states = this.createStates()

    const chest = env.BOT_MINING_CHEST_LOCATION
      ? env.BOT_MINING_CHEST_LOCATION.split(',')
      : ['0', '0', '0']

    this.settings.miningChest.set(parseInt(chest[0]), parseInt(chest[1]), parseInt(chest[2]))
  }
  public clearEvents() {
    this.bot.removeAllListeners('goal_reached')
    this.bot.removeAllListeners('diggingCompleted')
    this.bot.removeAllListeners('playerCollect')
  }

  public log(message: string) {
    this.logger.info(message)
  }
}

export { MineflayerBot }