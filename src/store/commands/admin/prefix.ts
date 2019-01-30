import { MessageSender } from "@messenger/base/message-sender";
import AdminCommand from "@store/commands/admin/admin-command";
import Command from "@store/commands/command";
import CommandExecutionData from "@store/commands/command-execution-data";

export default class Prefix extends AdminCommand implements Command {
  public getCommandName(): string {
    return "prefix";
  }

  public getCommandDescription(): string {
    return "Change the prefix for commands";
  }

  public getExpectedNumberArguments(): number {
    return 1;
  }

  protected validUsageTemplate(prefix: string): string {
    return `${prefix}${this.getCommandName()} <new prefix>`;
  }

  protected async executeCommand(
    data: CommandExecutionData,
    messageSender: MessageSender
  ): Promise<void> {
    const prefix = data.arguments[0];
    try {
      await data.store.updateCommandPrefix({
        serverId: data.rawMessage.serverId,
        newPrefix: prefix
      });
    } catch (e) {
      await messageSender.replyMessage("Failed to update prefix");
      return;
    }
    await messageSender.replyMessage(`Command prefix updated to ${prefix}`);
  }
}
