import {
  Bot,
  Collection,
  CreateSlashApplicationCommand,
  Guild,
  Interaction,
  VoiceState,
} from "@discordeno/bot";
import { joinCommand } from "./commands/join.ts";
import { pingCommand } from "./commands/ping.ts";
import { leaveCommand } from "./commands/leave.ts";

export type Command = {
  execute: (bot: Bot, interaction: Interaction) => Promise<unknown>;
} & CreateSlashApplicationCommand;
const commands: Command[] = [
  joinCommand,
  pingCommand,
  leaveCommand,
];
type VoiceStates = Guild["voiceStates"];
const voiceStatesByGuild = new Collection<bigint, VoiceStates>();
export const installCommands = async (bot: Bot, guildId: string) => {
  for (const command of commands) {
    await bot.helpers.createGuildApplicationCommand({
      name: command.name,
      description: command.description,
    }, guildId);
  }
  bot.transformers.customizers.voiceState = (
    _b,
    _payload,
    voiceState,
  ) => {
    const voiceStates = voiceStatesByGuild.get(voiceState.guildId) ??
      new Collection<bigint, VoiceState>();
    // 退出しているときはchannelIdが無い
    if (voiceState.channelId === undefined) {
      voiceStates.delete(voiceState.userId);
    } else {
      voiceStates?.set(voiceState.userId, voiceState);
    }
    if (voiceStates.size === 0) {
      voiceStatesByGuild.delete(voiceState.guildId);
    } else {
      voiceStatesByGuild.set(voiceState.guildId, voiceStates);
    }
    return voiceState;
  };

  // なんか書いて無いとvoiceStateが作られすらしないっぽいので適当に書いとく
  bot.events.voiceStateUpdate = (voiceState) => voiceState;

  bot.events.interactionCreate = async (interaction) => {
    const guild = interaction.guild;
    const voiceStates = voiceStatesByGuild.get(interaction?.guild.id);
    if (
      voiceStates &&
      guild.voiceStates === undefined
    ) {
      guild.voiceStates = voiceStates;
    }
    const command = commands.find((x) => x.name === interaction.data?.name);
    if (command === undefined) {
      console.log("command is undefined.");
      return;
    }
    await command.execute(bot, interaction);
  };
};
