import { MessageSender } from "@messenger/base/message-sender";
import AbstractCommand from "@store/commands/abstract-command";
import { Commands as AdminCommands } from "@store/commands/admin";
import { Commands as BasicCommands } from "@store/commands/basic";
import Command from "@store/commands/command";
import CommandExecutionData from "@store/commands/command-execution-data";
import ExecutableCustomCommand from "@store/commands/executable-custom-command";

export default class Help extends AbstractCommand implements Command {
  public getCommandName(): string {
    return "help";
  }

  public getCommandDescription(): string {
    return "List all commands available for this server";
  }

  public getExpectedNumberArguments(): number {
    return 0;
  }

  protected async executeCommand(
    data: CommandExecutionData,
    messageSender: MessageSender
  ): Promise<void> {
    const basicCommandTitle = [`***__Basic Commands__***`];
    const basicCommandsToDisplay = this.createCommandsToDisplay(
      data.prefix,
      BasicCommands
    );
    const adminCommandTitle = [`***__Admin Commands__***`];
    const adminCommandsToDisplay = this.createCommandsToDisplay(
      data.prefix,
      AdminCommands
    );
    let toDisplay = basicCommandTitle.concat(
      basicCommandsToDisplay,
      ["\n"],
      adminCommandTitle,
      adminCommandsToDisplay
    );
    const customCommands = await data.store.getAllCustomCommands(
      data.rawMessage.server.id
    );
    if (customCommands.length !== 0) {
      const customCommandTitle = [`***__Custom Commands__***`];
      const customCommandsDisplay = this.createCommandsToDisplay(
        data.prefix,
        new Set(
          customCommands.map(custom => new ExecutableCustomCommand(custom))
        )
      );
      toDisplay = toDisplay.concat(
        ["\n"],
        customCommandTitle,
        customCommandsDisplay
      );
    }
    await messageSender.sendSplitMessage(toDisplay);
  }

  private createCommandsToDisplay(
    prefix: string,
    commands: Set<Command>
  ): string[] {
    return [...commands]
      .sort((c1: Command, c2: Command) => {
        return c1.getCommandName().localeCompare(c2.getCommandName());
      })
      .map(command => {
        return this.createHelpLine(
          prefix,
          command.getCommandName(),
          command.getCommandDescription()
        );
      });
  }

  private createHelpLine(
    prefix: string,
    name: string,
    description: string
  ): string {
    return `**${prefix}${name}** - ${description}`;
  }
}
