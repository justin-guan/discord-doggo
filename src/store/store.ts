import Command from "@store/commands/command";
import CommandStore from "@store/commands/command-store";
import { CustomCommand } from "@store/models/custom-command";
import DatabaseStore from "@store/mongo/database-store";

export default class Store {
  private databaseStore = new DatabaseStore();
  private commandStore = new CommandStore(this.databaseStore);

  public async initialize(uri: string): Promise<void> {
    await this.databaseStore.connect(uri);
  }

  public async destroy(): Promise<void> {
    await this.databaseStore.close();
  }

  public async updateCommandPrefix(update: CommandPrefixUpdate): Promise<void> {
    const guild = await this.databaseStore.getGuild(update.serverId);
    guild.setCommandPrefix(update.newPrefix);
    await guild.save();
  }

  public async getCommandPrefix(serverId: string): Promise<string> {
    const guild = await this.databaseStore.getGuild(serverId);
    return guild.getCommandPrefix();
  }

  public getCommand(
    serverId: string,
    commandName: string
  ): Promise<Command | undefined> {
    return this.commandStore.getCommand(serverId, commandName);
  }

  public getPreviousConnections(): Promise<string[]> {
    return this.databaseStore.getPreviousConnections();
  }

  public async saveConnections(voiceChannelIds: string[]): Promise<void> {
    await this.databaseStore.saveConnections(voiceChannelIds);
  }

  public async addCustomCommand(
    serverId: string,
    customCommand: CustomCommand
  ): Promise<void> {
    try {
      const guild = await this.databaseStore.getGuild(serverId);
      guild.addNewCustomCommand(customCommand);
      await guild.save();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async removeCustomCommand(
    serverId: string,
    commandName: string
  ): Promise<boolean> {
    const guild = await this.databaseStore.getGuild(serverId);
    const removed = guild.removeCustomCommand(commandName);
    await guild.save();
    return removed;
  }

  public async getAllCustomCommands(
    serverId: string
  ): Promise<CustomCommand[]> {
    const guild = await this.databaseStore.getGuild(serverId);
    return guild.getAllCustomCommands();
  }
}

export interface CommandPrefixUpdate {
  readonly newPrefix: string;
  readonly serverId: string;
}
