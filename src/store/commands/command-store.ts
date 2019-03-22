import { Database } from "@store/base/database";
import { Commands as AdminCommands } from "@store/commands/admin";
import { Commands as BasicCommands } from "@store/commands/basic";
import Command from "@store/commands/command";
import ExecutableCustomCommand from "./executable-custom-command";

export default class CommandStore {
  private databaseStore: Database;
  private commands: Map<string, Command> = new Map();

  constructor(databaseStore: Database) {
    this.databaseStore = databaseStore;
    this.setCommands(BasicCommands);
    this.setCommands(AdminCommands);
  }

  public async getCommand(
    serverId: string,
    commandName: string
  ): Promise<Command | undefined> {
    const command = this.commands.get(commandName);
    if (!command) {
      const guild = await this.databaseStore.getGuild(serverId);
      const customCommand = guild.getCustomCommand(commandName);
      return customCommand
        ? new ExecutableCustomCommand(customCommand)
        : undefined;
    }
    return command;
  }

  private setCommands(commands: Set<Command>): void {
    commands.forEach(command => {
      this.commands.set(command.getCommandName(), command);
    });
  }
}
