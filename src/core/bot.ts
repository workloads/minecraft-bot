import mineflayer, { Bot } from "mineflayer";
import { BotSettings, BotStates } from "src/utils/interfaces";
import { ConfigManager } from "./env";
import path from "path";
import fs from "fs";
import { FindBed, findDesiredBlock } from "../utils/findTools";
import { goals } from "mineflayer-pathfinder";
import { Vec3 } from "vec3";
import { Mining } from "../utils/mining";
import { configDotenv } from "dotenv";
import { Channel, Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import pino from "pino";
import pretty from "pino-pretty";
import chalk from "chalk";
configDotenv();

const env = process.env;

function inject(bot: mineflayer.Bot) {
  const COMMANDS_DIRECTORY = path.join(__dirname, "modules");
  const commands = fs
    .readdirSync(COMMANDS_DIRECTORY)
    .filter((x) => x.endsWith(".js"))
    .map((pluginName) => require(path.join(COMMANDS_DIRECTORY, pluginName)));

  bot.loadPlugins(commands);
}

class MineflayerBot {
  private bot: Bot;
  private settings: BotSettings;
  private states: BotStates;
  public logger;
  private discord: Client;
  public channel: Channel | undefined;

  private createSettings(): BotSettings {
    return {
      discordToken: env.DISCORD_TOKEN ? env.DISCORD_TOKEN : undefined,
      discordChannel: env.DISCORD_CHANNEL_ID ? env.DISCORD_CHANNEL_ID : undefined,
      inventoryPort: env.BOT_WEB_INVENTORY_PORT ? parseInt(env.BOT_WEB_INVENTORY_PORT) : undefined,
      viewPort: env.BOT_WEB_VIEW_PORT ? parseInt(env.BOT_WEB_VIEW_PORT) : undefined,
      interfacePort: env.BOT_WEB_INTERFACE_PORT ? parseInt(env.BOT_WEB_INTERFACE_PORT) : undefined,

      hungerPriority: env.BOT_HUNGER_PRIORITY === "foodpoints" ? "foodPoints" : "saturation",
      hungerLimit: env.BOT_HUNGER_THRESHOLD ? parseInt(env.BOT_HUNGER_THRESHOLD) : 10,
      hungerBannedFood: env.BOT_HUNGER_BANNED_FOODS ? env.BOT_HUNGER_BANNED_FOODS.split(",") : [],

      miningEnabled: env.BOT_MINING_ENABLED === "true" ? true : false,
      miningBlock: env.BOT_MINING_INITIAL_BLOCK ? env.BOT_MINING_INITIAL_BLOCK : undefined,
      miningDistance: env.BOT_MINING_SEARCH_DISTANCE
        ? parseInt(env.BOT_MINING_SEARCH_DISTANCE)
        : 18,
      miningChest: new Vec3(0, 0, 0),

      operators: env.BOT_CHAT_OPERATOR_ALLOWLIST ? env.BOT_CHAT_OPERATOR_ALLOWLIST : [],
      commandsEnabled: env.BOT_CHAT_ALLOW_CHAT === "true" ? true : false,
      commandsPrefix: env.BOT_CHAT_COMMAND_PREFIX ? env.BOT_CHAT_COMMAND_PREFIX : "#",

      mappedBlocks: env.BOT_MAPPED_BLOCKS ? env.BOT_MAPPED_BLOCKS.split(",") : [],
    };
  }

  private createStates(): BotStates {
    return {
      isMining: false,
      stopMining: false,
      block: undefined
    };
  }

  public getBot(): Bot {
    return this.bot;
  }
  public getDiscordClient(): Client {
    return this.discord;
  }

  public getStates(): BotStates {
    return this.states;
  }

  public getSettings(): BotSettings {
    return this.settings;
  }

  public async reportToDiscord(username: string, command: string, params: string | null = null): Promise<void> {

    if (!this.channel) return;

    if (!this.channel.isTextBased()) return; // This will never happen.


    const embed = new EmbedBuilder()
      .setTitle("Mineflayer-based Excavation Assistant")
      .setColor(0x2F3136)
      .setThumbnail(`https://mc-heads.net/avatar/${username}`)
      .setAuthor({iconURL: `https://mc-heads.net/avatar/${this.bot.username}`, name: "Command Report"})
      .setTimestamp();

    embed.setDescription(`### Command has been issued.\n\`\`\`yml\n- Bot Username: ${this.bot.username}\n\n- Commander: ${username}\n\n- Command ran: ${command} ${params ? params : ""}\n\`\`\``);

      await this.channel.send({embeds : [embed]});
  }

  constructor() {
    this.channel = undefined;
    this.logger = pino(
      pretty({
        colorize: true,
        customPrettifiers: {
          time: (timestamp) => chalk.blueBright(`${timestamp}`),
          pid: () => chalk.cyanBright(`${process.env.BOT_NAME}`),
        },
        levelFirst: true,
      }),
    );

    const credentials = new ConfigManager().readConfig(this);
    if (!credentials) {
      process.exit(4);
    }

    this.bot = mineflayer.createBot({
      username: credentials.username,
      host: credentials.host,
      port: credentials.port,
      auth: credentials.auth,
      password: credentials.password,
      version: credentials.version,
    });
    inject(this.bot);

    this.discord = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageTyping],
    });
    this.discord.on("shardReady", () => {
      this.logger.info("Discord Interface is up and listening to commands.");
      if (!this.settings.discordChannel) {
        this.logger.error("Please insert the discord channel in .env file.");
        process.exit(0);
      }

      this.channel = this.discord.channels.cache.get(this.settings.discordChannel);
    });

    const chest = env.BOT_MINING_CHEST_LOCATION
      ? env.BOT_MINING_CHEST_LOCATION.split(",")
      : ["0", "0", "0"];

    this.settings = this.createSettings();
    this.states = this.createStates();

    this.settings.miningChest.set(parseInt(chest[0]), parseInt(chest[1]), parseInt(chest[2]));

    if (this.settings.discordToken === undefined) {
      this.logger.info("Discord token is not present, Discord Integration is not activated.");
      return;
    }

    this.discord.login(this.settings.discordToken).catch(()=> {
      this.logger.error("The discord token is invalid. Discord Integration is not activated.");
      return;
    });
  }

  public clearStates(): void {
    this.settings = this.createSettings();
    this.states = this.createStates();

    const chest = env.BOT_MINING_CHEST_LOCATION
      ? env.BOT_MINING_CHEST_LOCATION.split(",")
      : ["0", "0", "0"];

    this.settings.miningChest.set(parseInt(chest[0]), parseInt(chest[1]), parseInt(chest[2]));
  }
  public clearEvents() {
    this.bot.removeAllListeners("goal_reached");
    this.bot.removeAllListeners("diggingCompleted");
    this.bot.removeAllListeners("playerCollect");
  }

  public async goMine(block: string | undefined): Promise<void> {
    if (!block) return;

    block = block.toLowerCase().replaceAll(" ", "_");

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mcData = require("minecraft-data")(this.bot.version);

    if (this.states.isMining) {
      this.logger.info("The bot is already mining.");
      return;
    }

    if (this.getSettings().mappedBlocks.includes(block)) {
      block = block + "_block";
    }

    if (!mcData.blocksByName[block]) {
      this.logger.info(`Could not find the block ${block} on the registry.`);
      return;
    }

    this.getStates().block = block.toLowerCase().replaceAll(" ", "_");

    const desired = await findDesiredBlock(this);

    if (!desired) {
      this.logger.info("Could not find the block %s nearby", this.getStates().block);
      return;
    }

    this.logger.info("Starting to mine: %s", desired.name.replaceAll("_", " "));

    this.states.isMining = true;

    await this.bot.tool.equipForBlock(desired);

    Mining(this);
  }

  public goSleep(): void {
    if (this.bot.time.isDay) {
      this.logger.info("cannot sleep at day");
      return;
    }

    const bed = FindBed(this);

    if (!bed) {
      this.logger.info("cannot find a bed");
      return;
    }

    this.bot.pathfinder.setGoal(null);

    const bed_goal = new goals.GoalGetToBlock(bed.position.x, bed.position.y, bed.position.z);

    this.bot.pathfinder.setGoal(bed_goal);

    this.bot.once("goal_reached", async () => {
      this.bot.sleep(bed).catch((reason) => {
        if (reason.message.includes("monsters nearby")) {
          this.logger.info("Monsters nearby!");
        }
      });
    });
  }
}

export { MineflayerBot };
