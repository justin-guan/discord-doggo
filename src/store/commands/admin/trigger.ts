import { MessageSender } from "@messenger/base/message-sender";
import AdminCommand from "@store/commands/admin/admin-command";
import Command from "@store/commands/command";
import CommandExecutionData from "@store/commands/command-execution-data";

export default class Trigger extends AdminCommand implements Command {
  public getCommandName(): string {
    return "trigger";
  }

  public getCommandDescription(): string {
    return "Change the trigger for commands";
  }

  public getExpectedNumberArguments(): number {
    return 1;
  }

  protected validUsageTemplate(trigger: string): string {
    return `${trigger}${this.getCommandName()} <new trigger>`;
  }

  protected async executeCommand(
    data: CommandExecutionData,
    messageSender: MessageSender
  ): Promise<void> {
    const prefix = data.arguments[0];
    await data.store.updateCommandPrefix({
      serverId: data.rawMessage.serverId,
      newPrefix: prefix
    });
    await messageSender.replyMessage(`Command prefix updated to ${prefix}`);
  }
}
