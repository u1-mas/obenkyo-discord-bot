import { InteractionResponseTypes } from "@discordeno/bot";
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
    const { user, guild } = interaction;
    const voiceState = guild.voiceStates?.get(user.id);
    if (voiceState?.channelId === undefined) {
      await bot.helpers.sendInteractionResponse(
        interaction.id,
        interaction.token,
        {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: {
            content:
              "参加先チャンネルが見つかりませんでした。既にボイスチャンネルに参加している場合は、一度入り直してから再度お試しください。",
          },
        },
      );
      return;
    }

    const voiceChannel = await bot.helpers.getChannel(voiceState.channelId);
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
