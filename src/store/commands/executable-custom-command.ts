import { MessageSender } from "@messenger/base/message-sender";
import AbstractCommand from "@store/commands/abstract-command";
import Command from "@store/commands/command";
import CommandExecutionData from "@store/commands/command-execution-data";
import { CustomCommand } from "@store/models/custom-command";

export default class ExecutableCustomCommand extends AbstractCommand {
  private customCommand: CustomCommand;

  constructor(customCommand: CustomCommand) {
    super();
    this.customCommand = customCommand;
  }

  public getCommandName(): string {
    return this.customCommand.name;
  }
  public getCommandDescription(): string {
    return this.customCommand.description;
  }
  public getExpectedNumberArguments(): number {
    return 0;
  }
  protected async executeCommand(
    data: CommandExecutionData,
    messageSender: MessageSender
  ): Promise<void> {
    await messageSender.replyMessage(
      "Stub: execute custom command " + this.customCommand.name
    );
  }
}
