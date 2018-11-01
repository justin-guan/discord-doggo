import DiscordEventHandler from "@handlers/discord/discord-event-handler";
import { LoginInfo, Messenger } from "@messenger/base/messenger";
import { Client } from "discord.js";

class DiscordMessenger implements Messenger {
  private client: Client = new Client();
  private eventHandler: DiscordEventHandler = new DiscordEventHandler();

  public async start(loginInfo: LoginInfo): Promise<void> {
    this.client.on("ready", this.eventHandler.onReady);
    this.client.on("message", this.eventHandler.onMessage);
    const clientPromise = this.client.login(loginInfo.messengerToken);
    const handlerPromise = this.eventHandler.initialize(loginInfo.databaseUrl);
    await Promise.all([clientPromise, handlerPromise]);
  }

  public async stop(): Promise<void> {
    const clientPromise = this.client.destroy();
    const handlerPromise = this.eventHandler.destroy();
    await Promise.all([clientPromise, handlerPromise]);
  }
}

const messenger = new DiscordMessenger() as Messenger;
export default messenger;
