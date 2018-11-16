import { MessageSender } from "@messenger/base/message-sender";
import { PartialTextBasedChannelFields } from "discord.js";

export class DiscordMessageSender implements MessageSender {
  private channel: PartialTextBasedChannelFields;

  constructor(channel: PartialTextBasedChannelFields) {
    this.channel = channel;
  }

  public async sendMessage(message: string): Promise<void> {
    await this.channel.send(message);
  }

  public async sendSplitMessage(splitMessage: string[]): Promise<void> {
    await this.channel.send(splitMessage, { split: true });
  }
}
