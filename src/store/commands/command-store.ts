import { Commands } from "@store/commands/basic";
import Command from "@store/commands/command";

export default class CommandStore {
  private commands: Map<string, Command> = new Map();

  constructor() {
    Commands.forEach(command => {
      this.commands.set(command.getCommandName().toLowerCase(), command);
    });
  }

  public getCommand(
    serverId: string,
    commandName: string
  ): Command | undefined {
    return this.commands.get(commandName);
  }
}
