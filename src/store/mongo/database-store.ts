import { Database } from "@store/base/database";
import ClientVoiceConnectionsConfig from "@store/models/client-voice-connections-config";
import Guild from "@store/models/guild";
import * as DatabaseClientVoiceConnectionsConfigModel from "@store/mongo/database-models/client-voice-connections-config";
import * as DatabaseGuildModel from "@store/mongo/database-models/guild";
import mongoose from "mongoose";

export default class DatabaseStore implements Database {
  private database = mongoose.connection;
  private guildCache = new Map<string, Guild>();
  private connectionsConfig: ClientVoiceConnectionsConfig | undefined;

  public async connect(uri: string): Promise<void> {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async getAllGuilds(): Promise<Guild[]> {
    const guilds = await DatabaseGuildModel.Guild.findAllGuilds();
    guilds.forEach(value => {
      this.guildCache.set(value.getId(), value);
    });
    return guilds;
  }

  public async getGuild(id: string): Promise<Guild> {
    let guild = this.guildCache.get(id);
    if (!guild) {
      guild = await DatabaseGuildModel.Guild.findGuild(id);
      this.guildCache.set(id, guild);
    }
    return guild;
  }

  public async getPreviousConnections(): Promise<string[]> {
    const connectionsConfig = await this.getClientVoiceConnectionsConfig();
    return connectionsConfig.getLastJoinedVoiceChannelIds();
  }

  public async saveConnections(voiceChannelIds: string[]): Promise<void> {
    const connectionsConfig = await this.getClientVoiceConnectionsConfig();
    await connectionsConfig.saveConnectedVoiceChannelIds(voiceChannelIds);
  }

  private async getClientVoiceConnectionsConfig(): Promise<
    ClientVoiceConnectionsConfig
  > {
    if (!this.connectionsConfig) {
      this.connectionsConfig = await DatabaseClientVoiceConnectionsConfigModel.ClientVoiceConnectionsConfig.getConnectionsConfig();
    }
    return this.connectionsConfig;
  }
}
