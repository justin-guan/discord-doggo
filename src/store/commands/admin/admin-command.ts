import { MessageSender } from "@messenger/base/message-sender";
import AbstractCommand from "@store/commands/abstract-command";
import Command from "@store/commands/command";
import CommandExecutionData from "@store/commands/command-execution-data";

export default abstract class AdminCommand extends AbstractCommand
  implements Command {
  public abstract getCommandName(): string;
  public abstract getCommandDescription(): string;
  public abstract getExpectedNumberArguments(): number;
  public async execute(
    data: CommandExecutionData,
    messageSender: MessageSender
  ): Promise<void> {
    if (data.rawMessage.author.isAdmin()) {
      super.execute(data, messageSender);
    } else {
      await messageSender.replyMessage("You are not an Admin");
    }
  }
}
