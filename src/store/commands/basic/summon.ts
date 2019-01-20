import { MessageSender } from "@messenger/base/message-sender";
import Command from "@store/commands/command";
import CommandExecutionData from "@store/commands/command-execution-data";

export default class Summon implements Command {
  public getCommandName(): string {
    return "summon";
  }

  public getCommandDescription(): string {
    return "Summon me to your current voice channel";
  }

  public async execute(
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
