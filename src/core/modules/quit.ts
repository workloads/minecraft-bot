import mineflayer, { BotEvents } from "mineflayer";
import { instance } from "../../index";

/**
 * @param {mineflayer.Bot} bot
 */

module.exports = (bot: mineflayer.Bot) => {
  bot.addChatPattern("quit", new RegExp(`<(.*)> ${instance.getSettings().commandsPrefix}quit`), {
    repeat: true,
    parse: true,
  });

  bot.on("chat:quit" as keyof BotEvents, ([[username]]: string) => {
    if (!instance.getSettings().commandsEnabled) return;
    if (instance.getSettings().operators.includes(username)) {
      process.exit(4);
    }
  });
};
