import { ChannelTypes, InteractionResponseTypes } from "@discordeno/bot";
import { Command } from "../commands.ts";
import {
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    entersState,
    joinVoiceChannel,
    StreamType,
    VoiceConnectionStatus,
} from "@discordjs/voice";
import { createDiscordenoAdapter } from "../libs/adapter.ts";

const player = createAudioPlayer();

export const joinCommand: Command = {
    name: "join",
    description: "ボイスチャンネルに参加します",
    execute: async (bot, interaction) => {
        const { guild, user } = interaction;
        // TODO: interaction.userからそのuserが参加しているボイスチャンネルを見つける

        if (guild.id === undefined) {
            throw new Error();
        }
        const channels = await bot.helpers.getChannels(guild.id);
        const voiceChannel = channels.find((x) =>
            x.type === ChannelTypes.GuildVoice
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

        const resource = createAudioResource(
            "./多分、風_drum.wav",
            {
                inputType: StreamType.Arbitrary,
            },
        );
        const connection = joinVoiceChannel({
            channelId: voiceChannel!.id.toString(),
            guildId: guild.id.toString(),
            adapterCreator: createDiscordenoAdapter(bot, guild.id),
        });

        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
        } catch (error) {
            connection.destroy();
            throw error;
        }

        connection.subscribe(player);

        player.play(resource);

        await entersState(player, AudioPlayerStatus.Playing, 5000);
    },
};
