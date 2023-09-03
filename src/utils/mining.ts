import { goals } from "mineflayer-pathfinder";
import { findDesiredBlock } from "./findTools";
import { MineflayerBot } from "src/core/bot";
import chalk from "chalk";

async function Mining(instance: MineflayerBot): Promise<void> {

    const bot = instance.getBot();

    if (instance.getStates().stopMining) {
        instance.getStates().stopMining = false;

        instance.logger.info("Stopped the mining process.");
        return;
    }

    if (bot.inventory.emptySlotCount() <= 1) {
        instance.logger.info("inventory full, depositing.");

        await deposit(instance, true);
        return;
    }

    const desired = await findDesiredBlock(instance);

    if (!desired) {
        instance.logger.info("Could not find anymore of %s, depositing all blocks,", instance.getStates().block?.replace("_", " "));
        instance.getStates().isMining = false;
        await deposit(instance, false);
        return;
    }

    bot.pathfinder.setGoal(new goals.GoalNear(desired.position.x, bot.entity.position.y, desired.position.z, 2));

    bot.once("goal_reached", async () => {
        bot.dig(desired, true);

        bot.once("diggingCompleted", async (block) => {

            bot.pathfinder.setGoal(new goals.GoalNear(block.position.x, bot.entity.position.y, block.position.z, 1));
            await bot.waitForTicks(5);
            instance.clearEvents();
            await Mining(instance);
        });
    });
}

async function deposit(instance: MineflayerBot, retry = false): Promise<void> {

    const bot = instance.getBot();

    const goal = new goals.GoalGetToBlock(
        instance.getSettings().miningChest.x,
        instance.getSettings().miningChest.y,
        instance.getSettings().miningChest.z
    );

    bot.pathfinder.setGoal(goal);

    bot.once("goal_reached", async () => {

        const chest = bot.findBlock(
            {
                matching: (block) => block.position.equals(instance.getSettings().miningChest),
                useExtraInfo: true
            }
        );

        if (chest.name === "chest" || chest.name === "barrel") {
            const openChest = await bot.openChest(chest);

            for (const item of bot.inventory.items()) {
                if (item.name === instance.getStates().block) {
                    await openChest.deposit(item.type, null, item.count);
                    await bot.waitForTicks(10);
                }
            }

            openChest.close();

            instance.logger.info("deposited all blocks!");

            if (retry) {
                await Mining(instance);
            }
        } else {
            instance.logger.error(chalk.redBright("Could not find the chest mentioned in the environmental variable."));
        }
    });
}

export { Mining };