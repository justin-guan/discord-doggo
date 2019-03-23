import logger = require("@logger");
import { MessageSender } from "@messenger/base/message-sender";
import Author from "@model/base/author";
import Client from "@model/base/client";
import AbstractCommand from "@store/commands/abstract-command";
import CommandExecutionData from "@store/commands/command-execution-data";
import { CustomCommand, CustomCommandType } from "@store/models/custom-command";

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
    switch (this.customCommand.type) {
      case CustomCommandType.VOICE:
        await this.executeVoice(
          data.rawMessage.author,
          data.client,
          messageSender
        );
        break;
      case CustomCommandType.TEXT:
        await this.executeText(messageSender);
        break;
      default:
        logger.error(`Invalid custom command:\n${this.customCommand}`);
        break;
    }
  }

  private async executeVoice(
    author: Author,
    client: Client,
    messageSender: MessageSender
  ): Promise<void> {
    try {
      const voiceChannelId = await author.joinCurrentVoiceChannel();
      await client.play(voiceChannelId, this.customCommand.action);
    } catch (e) {
      await messageSender.replyMessage(
        "You must be in a voice channel to use this command"
      );
    }
  }

  private async executeText(messageSender: MessageSender): Promise<void> {
    await messageSender.sendMessage(this.customCommand.action);
  }
}
