import { createBot, Intents, InteractionResponseTypes } from "@discordeno/bot";
import { load } from "@std/dotenv";

const env = await load();
const token = env.DISCORD_BOT_TOKEN;
if (token === undefined) {
  throw new Error("DISCORD_BOT_TOKEN is not found.");
}
const bot = createBot({
  token: token,
  intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent,
  events: {
    ready() {
      console.log("start.");
    },
  },
});

bot.transformers.desiredProperties.interaction.id = true;
bot.transformers.desiredProperties.interaction.data = true;
bot.transformers.desiredProperties.interaction.type = true;
bot.transformers.desiredProperties.interaction.token = true;
bot.transformers.desiredProperties.interaction.channelId = true;

bot.transformers.desiredProperties.message.content = true;

bot.transformers.desiredProperties.role.id = true;

bot.events.messageCreate = (msg) => {
  console.log("content: ", msg.content);
};

await bot.rest.createGlobalApplicationCommand({
  name: "ping",
  description: "ping!",
});
bot.events.interactionCreate = async (interaction) => {
  console.log("interaction name: ", interaction.data?.name);
  if (interaction.data?.name === "ping") {
    return await bot.helpers.sendInteractionResponse(
      interaction.id,
      interaction.token,
      {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: {
          content: "pong!",
        },
      },
    );
  }
};

await bot.start();
