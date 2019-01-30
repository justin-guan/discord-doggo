import { MessageSender } from "@messenger/base/message-sender";
import AbstractCommand from "@store/commands/abstract-command";
import Command from "@store/commands/command";
import CommandExecutionData from "@store/commands/command-execution-data";

export default class Summon extends AbstractCommand implements Command {
  public getCommandName(): string {
    return "summon";
  }

  public getCommandDescription(): string {
    return "Summon me to your current voice channel";
  }

  public getExpectedNumberArguments(): number {
    return 0;
  }

  protected async executeCommand(
    message: CommandExecutionData,
    messageSender: MessageSender
  ): Promise<void> {
    try {
      await message.rawMessage.author.joinCurrentVoiceChannel();
    } catch (e) {
      await messageSender.replyMessage(
        "You need to be in a voice channel to summon me"
      );
    }
  }
}
