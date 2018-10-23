import logger from "@logger";
import { Client, Message } from "discord.js";
import Messenger from "messenger/messenger";

class DiscordMessenger implements Messenger {
  private client: Client = new Client();

  public async login(token: string): Promise<void> {
    this.client.login(token);
  }

  public start(): void {
    this.client.on("ready", () => this.onReady());
    this.client.on("message", message => this.onMessage(message));
  }

  private onReady(): void {
    logger.info("Client is ready!");
  }

  private onMessage(message: Message): void {
    logger.info(message.content);
  }
}

export default new DiscordMessenger();
