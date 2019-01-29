import { MessageSender } from "@messenger/base/message-sender";
import Command from "@store/commands/command";
import CommandExecutionData from "@store/commands/command-execution-data";

export default class Banish implements Command {
  public getCommandName(): string {
    return "banish";
  }

  public getCommandDescription(): string {
    return "Banish me from your current voice channel";
  }

  public getExpectedNumberArguments(): number {
    return 0;
  }

  public async execute(
    message: CommandExecutionData,
    messageSender: MessageSender
  ): Promise<void> {
    try {
      await message.rawMessage.author.leaveCurrentVoiceChannel();
    } catch (e) {
      await messageSender.replyMessage("I'm not in your voice channel");
    }
  }
}
