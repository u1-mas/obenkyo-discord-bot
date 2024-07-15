import { createBot, Intents } from "@discordeno/bot";
import { load } from "@std/dotenv";
import { installCommands } from "./commands.ts";

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

bot.events.messageCreate = (msg) => {
  console.log(msg.content);
};

await installCommands(bot, guildId);
await bot.start();
