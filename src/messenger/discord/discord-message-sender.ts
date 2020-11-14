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

  public async sendDM(message: string): Promise<void> {
    await this.message.author.send(message);
  }

  public async replyMessage(message: string): Promise<void> {
    await this.message.reply(message);
  }

  public getFormattedCustomEmoji(emojiId: string): string {
    const formatted = this.message.client.emojis.cache.find(
      emoji => emoji.id === emojiId
    );
    return formatted ? formatted.toString() : emojiId;
  }
}
