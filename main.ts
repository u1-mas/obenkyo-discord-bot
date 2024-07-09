import { createBot, Intents } from "@discordeno/bot";
import { load } from "@std/dotenv";

const env = await load();
const token = env.DISCORD_BOT_TOKEN;
if (token === undefined) {
  throw new Error("DISCORD_BOT_TOKEN is not found.");
}
export const bot = createBot({
  token: token,
  intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent,
  events: {
    ready() {
      console.log("start.");
    },
  },
});

bot.transformers.desiredProperties.message.content = true;

bot.events.messageCreate = (msg) => {
  console.log(msg.content);
};

await bot.start();
