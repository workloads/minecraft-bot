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
  private discord: Client

  private settings: BotSettings
  private states: BotStates

  public log
  public channel: Channel | undefined = undefined
  public locale: Strings
  public api: Api

  private createSettings(): BotSettings {
    return {
      discordToken: env.DISCORD_TOKEN ? env.DISCORD_TOKEN : undefined,
      discordChannel: env.DISCORD_CHANNEL_ID ? env.DISCORD_CHANNEL_ID : undefined,
      discordEmbedColor: env.DISCORD_EMBED_COLOR ? env.DISCORD_EMBED_COLOR : '2f3136',

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

      operators: env.BOT_CHAT_OPERATOR_ALLOWLIST ? env.BOT_CHAT_OPERATOR_ALLOWLIST.split(',') : [],
      commandsEnabled: env.BOT_CHAT_ALLOW_CHAT === 'true' ? true : false,
      commandsPrefix: env.BOT_CHAT_COMMAND_PREFIX ? env.BOT_CHAT_COMMAND_PREFIX : '#',

      mappedBlocks: env.BOT_MAPPED_BLOCKS ? env.BOT_MAPPED_BLOCKS.split(',') : [],
    }
  }

  private createStates(): BotStates {
    return {
      isMining: false,
      stopMining: false,
      block: undefined
    }
  }

  public getBot(): Bot {
    return this.bot
  }
  public getDiscordClient(): Client | undefined {
    return this.discord
  }

  public getStates(): BotStates {
    return this.states
  }

  public getSettings(): BotSettings {
    return this.settings
  }

  public clearEvents() {
    this.bot.removeAllListeners('goal_reached')
    this.bot.removeAllListeners('diggingCompleted')
    this.bot.removeAllListeners('playerCollect')
  }

  constructor(strings: Strings) {
    this.log = pino(
      pretty({
        colorize: true,
        customPrettifiers: {
          time: (timestamp) => `\x1b[34m${timestamp}\x1b[0m`,
          pid: () => `\x1b[36m${process.env.BOT_NAME}\x1b[0m`,
        },
        levelFirst: true,
      }),
    )

    // General Configuration.
    this.discord = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageTyping],
    })

    this.locale = strings
    this.settings = this.createSettings()
    this.states = this.createStates()

    const chest_location = env.BOT_MINING_CHEST_LOCATION
      ? env.BOT_MINING_CHEST_LOCATION.split(',')
      : ['0', '0', '0']
    this.settings.miningChest.set(
      parseInt(chest_location[0]),
      parseInt(chest_location[1]),
      parseInt(chest_location[2]),
    )

    this.api = new Api(this)

    // Minecraft Bot Initializer.
    const credentials = new ConfigManager().readConfig(this)
    if (!credentials) {
      this.log.info(strings.msg_credentials_failure)
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

    this.bot.loadPlugin(command_handler)

    // Discord Integration Initializer.
    if (this.settings.discordToken === undefined) {
      this.log.info(strings.msg_discord_token_not_present)
      return
    }

    this.discord.on('shardReady', () => {
      this.log.info(strings.msg_discord_success)

      if (!this.settings.discordChannel) {
        this.log.error(strings.msg_discord_request_channel_id)
        return
      }

      if (this.settings.discordChannel) {
        this.channel = this.discord.channels.cache.get(this.settings.discordChannel)
      } else {
        this.log.info(strings.msg_discord_request_channel_id)
      }
    })

    this.discord.login(this.settings.discordToken).catch(() => {
      this.log.error(strings.msg_discord_token_failure)
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

  public async send_to_discord(
    username: string,
    command: string,
    params: string | null = null,
  ): Promise<void> {
    if (!this.channel) return

    if (!this.channel.isTextBased()) return // This will never happen.

    const embed = new EmbedBuilder()
      .setTitle(this.locale.embed_title)
      .setColor(`#${env.DISCORD_EMBED_COLOR}`) // translates to `#2f3136`
      .setThumbnail(`https://mc-heads.net/avatar/${username}`)
      .setAuthor({
        iconURL: `https://mc-heads.net/avatar/${this.bot.username}`,
        name: this.locale.embed_author_text,
      })
      .setTimestamp()

    embed.setDescription(
      `### ${this.locale.embed_description_command}
\`\`\`yml
- ${this.locale.embed_description_self_label} ${this.bot.username}
      
- ${this.locale.embed_description_commander} ${username}
      
- ${this.locale.embed_description_command} ${command} ${params ? params : ''}
\`\`\``,
    )
    
    try {
      await this.channel.send({ embeds: [embed] })
    } catch (error) {
      this.locale.msg_discord_channel_failure
    }
  }
}

export { MineflayerBot }
