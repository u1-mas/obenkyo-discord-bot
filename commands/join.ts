import { ChannelTypes, InteractionResponseTypes } from "@discordeno/bot";
import { Command } from "../commands.ts";

export const joinCommand: Command = {
    name: "join",
    description: "コマンドを実行した人が居るボイスチャンネルに参加します",
    execute: async (bot, interaction) => {
        const channels = await bot.helpers.getChannels(interaction.guildId!);
        const voiceChannel = channels.find((x) =>
            x.type === ChannelTypes.GuildVoice
        );
        const gateway = bot.gateway;
        await gateway.joinVoiceChannel(
            interaction.guildId!,
            voiceChannel?.id!,
        );
        await bot.helpers.sendInteractionResponse(
            interaction.id,
            interaction.token,
            {
                type: InteractionResponseTypes.ChannelMessageWithSource,
                data: {
                    content: "join!",
                },
            },
        );
    },
};
