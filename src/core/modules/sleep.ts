import mineflayer, { BotEvents } from "mineflayer";
import { instance } from "../../index";
import { Mining } from "../../utils/mining";

/**
 * @param {mineflayer.Bot} bot
 */


module.exports = (bot: mineflayer.Bot) => {
    bot.addChatPattern("sleep", new RegExp(`<(.*)> ${instance.getSettings().commandsPrefix}sleep`), { repeat: true, parse: true });

    bot.addChatPattern("wake", new RegExp(`<(.*)> ${instance.getSettings().commandsPrefix}(wake|wake up)`), { repeat:true, parse: true });

    bot.on("chat:sleep" as keyof BotEvents, async ([[username]] : string) => {
        if (!instance.getSettings().commandsEnabled) return;

        if (instance.getSettings().operators.includes(username)) {
            instance.sendToDiscord(`sleep command was executed by ${username}.`);

            if (instance.getStates().isMining) {
                instance.getStates().stopMining = true;
                await bot.waitForTicks(5);
            }

            instance.goSleep();
        }
    });

    bot.on("chat:wake" as keyof BotEvents, ([[username]] : string) => {
        if (!instance.getSettings().commandsEnabled) return;

        if (instance.getSettings().operators.includes(username)) {
            if (bot.isSleeping) {
                bot.wake();
            }
        }
    });

    bot.on("wake", async () => {
        if (instance.getStates().isMining) {
            await Mining(instance);
        }
    });
};