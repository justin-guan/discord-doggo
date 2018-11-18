import { MessageSender } from "@messenger/base/message-sender";
import { Message } from "discord.js";

export class DiscordMessageSender implements MessageSender {
  private message: Message;

  constructor(message: Message) {
    this.message = message;
  }

  public async sendMessage(message: string): Promise<void> {
    await this.message.channel.send(message);
  }

  public async sendSplitMessage(splitMessage: string[]): Promise<void> {
    await this.message.channel.send(splitMessage, { split: true });
  }

  public async replyMessage(message: string): Promise<void> {
    await this.message.reply(message);
  }
}
