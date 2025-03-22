import { VoiceConnection } from "@discordjs/voice";

class ConnectionManager {
    connections = new Map<
        bigint,
        VoiceConnection
    >();

    set(guildId: bigint, connection: VoiceConnection) {
        this.connections.set(guildId, connection);
    }

    get(guildId: bigint) {
        return this.connections.get(guildId);
    }

    delete(guildId: bigint) {
        return this.connections.delete(guildId);
    }
}

export const connectionManager = new ConnectionManager();
