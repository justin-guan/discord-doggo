import { MessageSender } from "@messenger/base/message-sender";
import { Commands } from "@store/commands/basic";
import Command from "@store/commands/command";
import CommandExecutionData from "@store/commands/command-execution-data";

export default class Help implements Command {
  public getCommandName(): string {
    return "help";
  }

  public getCommandDescription(): string {
    return "List all commands available for this server";
  }

  public async execute(
    data: CommandExecutionData,
    messageSender: MessageSender
  ): Promise<void> {
    const basicCommandTitle = [`***__Basic Commands__***`];
    const basicCommandsToDisplay = [...Commands]
      .sort((c1: Command, c2: Command) => {
        return c1.getCommandName().localeCompare(c2.getCommandName());
      })
      .map(command => {
        return this.createHelpLine(
          data.trigger,
          command.getCommandName(),
          command.getCommandDescription()
        );
      });
    const toDisplay = basicCommandTitle.concat(basicCommandsToDisplay);
    await messageSender.sendSplitMessage(toDisplay);
  }

  private createHelpLine(
    trigger: string,
    name: string,
    description: string
  ): string {
    return `**${trigger}${name}** - ${description}`;
  }
}
