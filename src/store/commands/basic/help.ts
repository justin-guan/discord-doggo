import { MessageSender } from "@messenger/base/message-sender";
import { Commands as AdminCommands } from "@store/commands/admin";
import { Commands as BasicCommands } from "@store/commands/basic";
import Command from "@store/commands/command";
import CommandExecutionData from "@store/commands/command-execution-data";
import CommandImpl from "@store/commands/command-impl";

export default class Help extends CommandImpl implements Command {
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
      data.trigger,
      BasicCommands
    );
    const adminCommandTitle = [`***__Admin Commands__***`];
    const adminCommandsToDisplay = this.createCommandsToDisplay(
      data.trigger,
      AdminCommands
    );
    const toDisplay = basicCommandTitle.concat(
      basicCommandsToDisplay,
      ["\n"],
      adminCommandTitle,
      adminCommandsToDisplay
    );
    await messageSender.sendSplitMessage(toDisplay);
  }

  private createCommandsToDisplay(
    trigger: string,
    commands: Set<Command>
  ): string[] {
    return [...commands]
      .sort((c1: Command, c2: Command) => {
        return c1.getCommandName().localeCompare(c2.getCommandName());
      })
      .map(command => {
        return this.createHelpLine(
          trigger,
          command.getCommandName(),
          command.getCommandDescription()
        );
      });
  }

  private createHelpLine(
    trigger: string,
    name: string,
    description: string
  ): string {
    return `**${trigger}${name}** - ${description}`;
  }
}
