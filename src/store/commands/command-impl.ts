import { MessageSender } from "@messenger/base/message-sender";
import Command from "@store/commands/command";
import CommandExecutionData from "@store/commands/command-execution-data";

export default abstract class CommandImpl implements Command {
  public abstract getCommandName(): string;
  public abstract getCommandDescription(): string;
  public abstract getExpectedNumberArguments(): number;
  public async execute(
    data: CommandExecutionData,
    messageSender: MessageSender
  ): Promise<void> {
    if (this.hasValidArguments(data)) {
      await this.executeCommand(data, messageSender);
    } else {
      await messageSender.replyMessage(
        `Invalid command usage\nUsage: ${this.validUsageTemplate(data.prefix)}`
      );
    }
  }

  protected validUsageTemplate(prefix: string): string {
    return `${prefix}${this.getCommandName()}`;
  }

  protected abstract executeCommand(
    data: CommandExecutionData,
    messageSender: MessageSender
  ): Promise<void>;

  protected hasValidArguments(data: CommandExecutionData): boolean {
    return data.arguments.length === this.getExpectedNumberArguments();
  }
}
