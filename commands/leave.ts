import { InteractionResponseTypes } from "@discordeno/bot";
import { Command } from "../commands.ts";

export const leaveCommand: Command = {
    name: "leave",
    description: "ボイスチャンネルから抜けます",
    execute: async (bot, interaction) => {
        const gateway = bot.gateway;
        const guildId = interaction.guildId;
        if (guildId === undefined) {
            throw new Error();
        }
        await gateway.leaveVoiceChannel(guildId);
        await bot.helpers.sendInteractionResponse(
            interaction.id,
            interaction.token,
            {
                type: InteractionResponseTypes.ChannelMessageWithSource,
                data: {
                    content: "bye!",
                },
            },
        );
    },
};
