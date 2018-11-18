import { MessageSender } from "@messenger/base/message-sender";
import Command from "@store/commands/command";
import CommandExecutionData from "@store/commands/command-execution-data";

export default class Ping implements Command {
  public getCommandName(): string {
    return "ping";
  }

  public getCommandDescription(): string {
    return "Pong!";
  }

  public async execute(
    message: CommandExecutionData,
    messageSender: MessageSender
  ): Promise<void> {
    await messageSender.sendMessage("pong!");
  }
}
