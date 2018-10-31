import DiscordEventHandler from "@handlers/discord/discord-event-handler";
import { LoginInfo, Messenger } from "@messenger/base/messenger";
import Store from "@store/store";
import { Client } from "discord.js";

class DiscordMessenger implements Messenger {
  private client: Client = new Client();
  private eventHandler: DiscordEventHandler = new DiscordEventHandler();
  private store = new Store();

  public async start(loginInfo: LoginInfo): Promise<void> {
    this.client.on("ready", this.eventHandler.onReady);
    this.client.on("message", this.eventHandler.onMessage);
    const clientPromise = this.client.login(loginInfo.messengerToken);
    const storePromise = this.store.initialize(loginInfo.databaseUrl);
    await Promise.all([clientPromise, storePromise]);
  }

  public async stop(): Promise<void> {
    const clientPromise = this.client.destroy();
    const storePromise = this.store.destroy();
    await Promise.all([clientPromise, storePromise]);
  }
}

const messenger = new DiscordMessenger() as Messenger;
export default messenger;
