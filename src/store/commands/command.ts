import { MessageSender } from "@messenger/base/message-sender";
import CommandExecutionData from "@store/commands/command-execution-data";

export default interface Command {
  getCommandName(): string;
  getCommandDescription(): string;
  getExpectedNumberArguments(): number;
  execute(
    data: CommandExecutionData,
    messageSender: MessageSender
  ): Promise<void>;
}
