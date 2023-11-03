import { configDotenv } from 'dotenv'
import { MineflayerBot } from './bot'

interface ServerConfig {
  host: string
  port: number
  username: string
  version: string
  password: string | undefined
  auth: 'microsoft' | 'mojang' | 'offline'
}

class ConfigManager {
  readConfig(instance: MineflayerBot): ServerConfig | undefined {
    configDotenv()

    if (
      !process.env.SERVER_PORT ||
      !process.env.SERVER_HOST ||
      !process.env.BOT_NAME ||
      !process.env.SERVER_VERSION
    ) {
      instance.logger.error(`\x1b[41m${instance.strings.msg_env_failure}\x1b[0m`)
      return undefined
    }

    return {
      host: process.env.SERVER_HOST,
      port: parseInt(process.env.SERVER_PORT),
      username: process.env.BOT_NAME,
      version: process.env.SERVER_VERSION,
      password: process.env.BOT_PASS ? process.env.BOT_PASS : undefined,
      auth: process.env.BOT_PASS ? 'mojang' : 'offline',
    }
  }
}

export { ConfigManager }
