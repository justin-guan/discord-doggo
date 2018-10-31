import DiscordEventHandler from "@handlers/discord/discord-event-handler";
import logger = require("@logger");
import Messenger from "@messenger/base/messenger";
import { Client } from "discord.js";

class DiscordMessenger implements Messenger {
  private client: Client = new Client();
  private eventHandler: DiscordEventHandler = new DiscordEventHandler();

  public async start(token: string): Promise<void> {
    this.client.on("ready", this.eventHandler.onReady);
    this.client.on("message", this.eventHandler.onMessage);
    await this.client.login(token);
  }

  public async stop(): Promise<void> {
    await this.client.destroy();
  }
}

const messenger = new DiscordMessenger() as Messenger;
export default messenger;
