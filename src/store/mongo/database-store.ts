import { Database } from "@store/base/database";
import Guild from "@store/models/guild";
import * as DatabaseGuildModel from "@store/mongo/database-models/guild";
import mongoose from "mongoose";

export default class DatabaseStore implements Database {
  private database = mongoose.connection;
  private guildCache = new Map<string, Guild>();

  public async connect(uri: string): Promise<void> {
    await mongoose.connect(
      uri,
      { useNewUrlParser: true }
    );
  }

  public async close(): Promise<void> {
    this.database.close();
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
}
