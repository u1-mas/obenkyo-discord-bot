import { Bot, ShardState } from "@discordeno/bot";
import { DiscordGatewayAdapterLibraryMethods } from "@discordjs/voice";
import { DiscordGatewayAdapterCreator } from "@discordjs/voice";

const adapters = new Map<bigint, DiscordGatewayAdapterLibraryMethods>();
const trackedClients = new Set();
const trackedShards = new Map();

const trackBot = (bot: Bot) => {
    if (trackedClients.has(bot)) {
        return;
    }

    trackedClients.add(bot);
    bot.events.voiceServerUpdate = (payload) => {
        const adapter = adapters.get(payload.guildId);
        if (adapter) {
            adapter.onVoiceServerUpdate({
                endpoint: payload.endpoint ?? null,
                guild_id: payload.guildId.toString(),
                token: payload.token,
            });
        }
    };

    bot.events.voiceStateUpdate = (payload) => {
        if (
            payload.guildId && payload.sessionId &&
            payload.userId.toString() === bot.id.toString()
        ) {
            const adapter = adapters.get(payload.guildId);
            if (adapter) {
                adapter.onVoiceStateUpdate({
                    channel_id: payload.channelId?.toString() ?? null,
                    user_id: payload.userId.toString(),
                    mute: false,
                    request_to_speak_timestamp:
                        payload.requestToSpeakTimestamp?.toString() ?? null,
                    self_video: false,
                    session_id: payload.sessionId,
                    guild_id: payload.guildId.toString(),
                    self_deaf: false,
                    deaf: false,
                    self_mute: false,
                    suppress: false,
                });
            }
        }
    };
};

const trackGuild = (guildId: bigint, shardId: number) => {
    let guilds = trackedShards.get(shardId);
    if (!guilds) {
        guilds = new Set();
        trackedShards.set(shardId, guilds);
    }

    guilds.add(guildId);
};

/**
 * Creates an adapter for a Voice Channel.
 *
 * @param bot - Discordeno bot client
 * @param guildId - The guild to connect to
 */
export function createDiscordenoAdapter(
    bot: Bot,
    guildId: bigint,
): DiscordGatewayAdapterCreator {
    const shardId = bot.gateway.calculateShardId(guildId);
    const shard = bot.gateway.shards.get(shardId);
    return (methods) => {
        adapters.set(guildId, methods);
        trackBot(bot);
        trackGuild(guildId, shardId);
        return {
            sendPayload(data) {
                if (shard && shard.state === ShardState.Connected) {
                    shard.send(data);
                    return true;
                }

                return false;
            },
            destroy() {
                return adapters.delete(guildId);
            },
        };
    };
}
