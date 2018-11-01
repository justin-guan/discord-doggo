import DatabaseStore from "@store/mongo/database-store";

export default class Store {
  private databaseStore = new DatabaseStore();

  public async initialize(uri: string): Promise<void> {
    await this.databaseStore.connect(uri);
  }

  public async destroy(): Promise<void> {
    await this.databaseStore.close();
  }

  public async updateCommandPrefix(update: CommandPrefixUpdate): Promise<void> {
    const guild = await this.databaseStore.getGuild(update.guildId);
    guild.setCommandPrefix(update.newPrefix);
    await guild.save();
  }

  public async getCommandPrefix(serverId: string): Promise<string> {
    const guild = await this.databaseStore.getGuild(serverId);
    return guild.getCommandPrefix();
  }
}

export interface CommandPrefixUpdate {
  readonly newPrefix: string;
  readonly guildId: string;
}
