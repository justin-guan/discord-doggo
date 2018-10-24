import { MessageSender } from "@messenger/message-sender";
import { PartialTextBasedChannelFields } from "discord.js";

export class DiscordMessageSender implements MessageSender {
  private channel: PartialTextBasedChannelFields;

  constructor(channel: PartialTextBasedChannelFields) {
    this.channel = channel;
  }

  public async sendMessage(message: string): Promise<void> {
    await this.channel.send(message);
  }
}
