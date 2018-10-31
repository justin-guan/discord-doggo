import { Database } from "@store/base/database";
import Guild from "@store/models/guild";
import * as DatabaseGuildModel from "@store/mongo/database-models/guild";
import mongoose from "mongoose";

export default class DatabaseStore implements Database {
  private database = mongoose.connection;

  public async connect(uri: string): Promise<void> {
    await mongoose.connect(
      uri,
      { useNewUrlParser: true }
    );
  }

  public async close(): Promise<void> {
    this.database.close();
  }

  public getAllGuilds(): Promise<Guild[]> {
    return DatabaseGuildModel.Guild.findAllGuilds();
  }

  public getGuild(id: string): Promise<Guild> {
    return DatabaseGuildModel.Guild.findGuild(id);
  }
}
