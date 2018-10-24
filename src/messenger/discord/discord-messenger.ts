import { Message } from "@handlers/base/message-handler";
import { DiscordMessageHandler } from "@handlers/discord/discord-message-handler";
import logger from "@logger";
import Messenger from "@messenger/base/messenger";
import { DiscordMessageSender } from "@messenger/discord/discord-message-sender";
import { Client, Message as DiscordMessage } from "discord.js";

class DiscordMessenger implements Messenger {
  private client: Client = new Client();
  private handler: DiscordMessageHandler = new DiscordMessageHandler();

  public async start(token: string): Promise<void> {
    this.client.on("ready", () => this.onReady());
    this.client.on("message", message => this.onMessage(message));
    await this.client.login(token);
  }

  public async stop(): Promise<void> {
    await this.client.destroy();
  }

  private onReady(): void {
    logger.info("Client is ready!");
  }

  private async onMessage(discordMessage: DiscordMessage): Promise<void> {
    const sender = new DiscordMessageSender(discordMessage.channel);
    const message: Message = {
      message: discordMessage.content,
      author: {
        name: discordMessage.author.username,
        isBot: discordMessage.author.bot
      }
    };
    await this.handler.handleMessage(sender, message);
  }
}

const messenger = new DiscordMessenger() as Messenger;
export default messenger;
