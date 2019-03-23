import { MessageSender } from "@messenger/base/message-sender";
import AbstractCommand from "@store/commands/abstract-command";
import CommandExecutionData from "@store/commands/command-execution-data";

export default class Delete extends AbstractCommand {
  public getCommandName(): string {
    return "delete";
  }

  public getCommandDescription(): string {
    return "Delete a custom command";
  }

  public getExpectedNumberArguments(): number {
    return 1;
  }

  protected validUsageTemplate(prefix: string): string {
    return `${prefix}${this.getCommandName()} <custom command name>`;
  }

  protected async executeCommand(
    data: CommandExecutionData,
    messageSender: MessageSender
  ): Promise<void> {
    const commandName = data.arguments[0];
    const removed = await data.store.removeCustomCommand(
      data.rawMessage.server.id,
      commandName
    );
    if (removed) {
      await messageSender.replyMessage(`Deleted custom command ${commandName}`);
    } else {
      await messageSender.replyMessage(`${commandName} could not be removed`);
    }
  }
}
