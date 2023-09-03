import mineflayer, {BotEvents} from "mineflayer";
import { instance } from "../../index";

/**
 * @param {mineflayer.Bot} bot
 */

module.exports = (bot: mineflayer.Bot) => {

    if (instance.getSettings().miningEnabled) {
        bot.addChatPattern("mine", new RegExp(`<(.*)> ${instance.getSettings().commandsPrefix}mine (.*)`), { repeat: true, parse: true });
    }

    bot.on("chat:mine" as keyof BotEvents, ([[username, block]]: string) => {
        if (!instance.getSettings().commandsEnabled) return;

        if (instance.getSettings().operators.includes(username)) {
            instance.sendToDiscord(`mine command was executed by ${username}.`);

            instance.goMine(block);
        }
    });
};