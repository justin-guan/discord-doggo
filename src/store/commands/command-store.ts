import { Commands as AdminCommands } from "@store/commands/admin";
import { Commands as BasicCommands } from "@store/commands/basic";
import Command from "@store/commands/command";

export default class CommandStore {
  private commands: Map<string, Command> = new Map();

  constructor() {
    this.setCommands(BasicCommands);
    this.setCommands(AdminCommands);
  }

  public getCommand(
    serverId: string,
    commandName: string
  ): Command | undefined {
    return this.commands.get(commandName);
  }

  private setCommands(commands: Set<Command>): void {
    commands.forEach(command => {
      this.commands.set(command.getCommandName(), command);
    });
  }
}
