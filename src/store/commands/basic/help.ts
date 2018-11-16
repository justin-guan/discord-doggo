import { MessageSender } from "@messenger/base/message-sender";
import Message from "@model/message";
import { Commands } from "@store/commands/basic";
import Command from "@store/commands/command";

export default class Help implements Command {
  public getCommandName(): string {
    return "help";
  }

  public getCommandDescription(): string {
    return "List all commands available for this server";
  }

  public async execute(
    message: Message,
    messageSender: MessageSender
  ): Promise<void> {
    const basicCommandTitle = [`***__Basic Commands__***`];
    const basicCommandsToDisplay = [...Commands]
      .sort((c1: Command, c2: Command) => {
        return c1.getCommandName().localeCompare(c2.getCommandName());
      })
      .map(command => {
        return `**${command.getCommandName()}** - ${command.getCommandDescription()}`;
      });
    const toDisplay = basicCommandTitle.concat(basicCommandsToDisplay);
    await messageSender.sendSplitMessage(toDisplay);
  }
}
