import Guild from "@store/models/guild";

export interface Database {
  connect(uri: string): Promise<void>;
  close(): Promise<void>;
  getAllGuilds(): Promise<Guild[]>;
  getGuild(id: string): Promise<Guild>;
}
