import DiscordEventHandler from "@handlers/discord/discord-event-handler";
import { LoginInfo, Messenger } from "@messenger/base/messenger";
import { Client } from "discord.js";

class DiscordMessenger implements Messenger {
  private client: Client = new Client();
  private eventHandler: DiscordEventHandler = new DiscordEventHandler(
    this.client
  );

  public async start(loginInfo: LoginInfo): Promise<void> {
    this.client.on("ready", this.eventHandler.onReady);
    this.client.on("message", this.eventHandler.onMessage);
    this.client.on("voiceStateUpdate", this.eventHandler.onVoiceStateUpdate);
    const clientPromise = this.client.login(loginInfo.messengerToken);
    const handlerPromise = this.eventHandler.initialize(loginInfo.databaseUrl);
    await Promise.all([clientPromise, handlerPromise]);
  }

  public async stop(): Promise<void> {
    await this.eventHandler.destroy();
    // Client needs to tear down any existing voice connections before shutdown
    // otherwise the voice connections may become zombie processes after client destruction
    this.client.voice?.connections?.forEach(connection => {
      connection.disconnect();
    });
    await this.client.destroy();
  }
}

const messenger = new DiscordMessenger() as Messenger;
export default messenger;
