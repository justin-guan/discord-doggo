import { MessageSender } from "@messenger/base/message-sender";
import AbstractCommand from "@store/commands/abstract-command";
import Command from "@store/commands/command";
import CommandExecutionData from "@store/commands/command-execution-data";

export default class Ping extends AbstractCommand implements Command {
  public getCommandName(): string {
    return "ping";
  }

  public getCommandDescription(): string {
    return "Pong!";
  }

  public getExpectedNumberArguments(): number {
    return 0;
  }

  protected async executeCommand(
    data: CommandExecutionData,
    messageSender: MessageSender
  ): Promise<void> {
    await messageSender.sendMessage("pong!");
  }
}
