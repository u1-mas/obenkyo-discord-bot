import { createBot, Intents } from "@discordeno/bot";
import { load } from "@std/dotenv";
import { installCommands } from "./commands.ts";
import { connectionManager } from "./libs/ConnectionManager.ts";
import {
  AudioPlayer,
  createAudioPlayer,
  createAudioResource,
  entersState,
} from "@discordjs/voice";
import { AudioPlayerStatus } from "../../.cache/deno/npm/registry.npmjs.org/@discordjs/voice/0.17.0/dist/index.d.mts";

const env = await load({ allowEmptyValues: true });
const guildId = env.GUILD_ID;
const token = env.DISCORD_BOT_TOKEN;
if (token === undefined) {
  throw new Error("DISCORD_BOT_TOKEN is not found.");
}
const bot = createBot({
  token: token,
  intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent |
    Intents.GuildVoiceStates,
  events: {
    ready() {
      console.log("start.");
    },
  },
  defaultDesiredPropertiesValue: true,
});

bot.events.messageCreate = async (msg) => {
  console.log(msg.content);

  if (msg.guildId === undefined) {
    return;
  }
  const connection = connectionManager.get(msg.guildId);
  if (connection === undefined) {
    return;
  }
  const player = createAudioPlayer();
  connection?.subscribe(player);
  // リソースをうまいこと作れればいけるはず
  const resources = createAudioResource();
  player.play(resources);
  await entersState(player, AudioPlayerStatus.Playing, 5000);
};

await installCommands(bot, guildId);
await bot.start();
