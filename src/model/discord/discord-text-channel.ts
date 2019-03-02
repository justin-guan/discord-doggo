import Message from "@model/base/message";
import TextChannel from "@model/base/text-channel";
import DiscordMessageImpl from "@model/discord/discord-message-impl";
import { TextChannel as DiscordTC } from "discord.js";

export default class DiscordTextChannel implements TextChannel {
  private textChannel: DiscordTC;

  constructor(textChannel: DiscordTC) {
    this.textChannel = textChannel;
  }

  public get name(): string {
    return this.textChannel.name;
  }

  public async getAllMessages(
    predicate: (message: Message) => void
  ): Promise<void> {
    const latest = await this.getLatestMessage();
    if (latest !== null) {
      predicate(latest);
      await this.getPreviousMessages(latest.id, predicate);
    }
  }

  private async getLatestMessage(): Promise<Message | null> {
    const latestMessage = await this.textChannel.fetchMessages({ limit: 1 });
    if (latestMessage.size > 0) {
      return new DiscordMessageImpl(latestMessage.last());
    }
    return null;
  }

  private async getPreviousMessages(
    from: string, // exclusive
    predicate: (message: Message) => void
  ): Promise<void> {
    const messages = await this.textChannel.fetchMessages({ before: from });
    for (const message of messages.values()) {
      predicate(new DiscordMessageImpl(message));
    }
    if (messages.size > 0) {
      await this.getPreviousMessages(messages.last().id, predicate);
    }
  }
}
