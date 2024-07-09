import {
    Bot,
    CreateSlashApplicationCommand,
    Interaction,
} from "@discordeno/bot";
import { joinCommand } from "./commands/join.ts";
import { pingCommand } from "./commands/ping.ts";

export type Command = {
    execute: (bot: Bot, interaction: Interaction) => Promise<unknown>;
} & CreateSlashApplicationCommand;
const commands: Command[] = [
    joinCommand,
    pingCommand,
];
export const installCommands = async (bot: Bot, guildId: string) => {
    for (const command of commands) {
        await bot.helpers.createGuildApplicationCommand({
            name: command.name,
            description: command.description,
        }, guildId);
    }
    bot.events.interactionCreate = async (interaction) => {
        console.log(interaction.guildId);
        console.log("interaction name: ", interaction.data?.name);
        const command = commands.find((x) => x.name === interaction.data?.name);
        if (command === undefined) {
            console.log("command is undefined.");
            console.log(command);
            return;
        }
        await command.execute(bot, interaction);
    };
};
