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

  public getExpectedNumberArguments(): number {
    return 0;
  }

  public async execute(
    data: CommandExecutionData,
    messageSender: MessageSender
  ): Promise<void> {
    await messageSender.sendMessage("pong!");
  }
}
