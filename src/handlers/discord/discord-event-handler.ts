import EventHandler from "@handlers/base/event-handler";
import { DiscordMessageSender } from "@messenger/discord/discord-message-sender";
import Message from "@model/message";
import { Message as DiscordMessage } from "discord.js";

export default class DiscordEventHandler {
  private eventHandler: EventHandler = new EventHandler();

  public async initialize(storeUri: string): Promise<void> {
    await this.eventHandler.initialize(storeUri);
  }

  public async destroy(): Promise<void> {
    await this.eventHandler.destroy();
  }

  public onReady = (): void => {
    this.eventHandler.onReady();
  };

  public onMessage = async (discordMessage: DiscordMessage): Promise<void> => {
    const sender = new DiscordMessageSender(discordMessage.channel);
    const message: Message = {
      guildId: discordMessage.guild.id,
      message: discordMessage.content,
      author: {
        name: discordMessage.author.username,
        isBot: discordMessage.author.bot
      }
    };
    await this.eventHandler.onMessage(sender, message);
  };
}
