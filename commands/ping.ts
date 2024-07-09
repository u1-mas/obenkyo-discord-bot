import { InteractionResponseTypes } from "@discordeno/bot";
import { Command } from "../commands.ts";

export const pingCommand: Command = {
    name: "ping",
    description: "ping!",
    execute: async (bot, interaction) => {
        await bot.helpers.sendInteractionResponse(
            interaction.id,
            interaction.token,
            {
                type: InteractionResponseTypes.ChannelMessageWithSource,
                data: {
                    content: "pong!",
                },
            },
        );
    },
};
