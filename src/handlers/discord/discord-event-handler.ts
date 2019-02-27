import EventHandler from "@handlers/base/event-handler";
import { DiscordMessageSender } from "@messenger/discord/discord-message-sender";
import DiscordClientImpl from "@model/discord/discord-client-impl";
import DiscordMemberImpl from "@model/discord/discord-member-impl";
import DiscordMessageImpl from "@model/discord/discord-message-impl";
import {
  Client as DiscordClient,
  GuildMember,
  Message as DiscordMessage,
  TextChannel
} from "discord.js";

export default class DiscordEventHandler {
  private eventHandler: EventHandler;

  constructor(client: DiscordClient) {
    this.eventHandler = new EventHandler(new DiscordClientImpl(client));
  }

  public async initialize(storeUri: string): Promise<void> {
    await this.eventHandler.initialize(storeUri);
  }

  public async destroy(): Promise<void> {
    await this.eventHandler.destroy();
  }

  public onReady = async (): Promise<void> => {
    await this.eventHandler.onReady();
  };

  public onMessage = async (discordMessage: DiscordMessage): Promise<void> => {
    const sender = new DiscordMessageSender(discordMessage);
    const message = new DiscordMessageImpl(discordMessage);
    await this.eventHandler.onMessage(sender, message);
  };

  public onVoiceStateUpdate = async (
    oldGuildMember: GuildMember,
    newGuildMember: GuildMember
  ): Promise<void> => {
    const oldMember = new DiscordMemberImpl(oldGuildMember);
    const newMember = new DiscordMemberImpl(newGuildMember);
    await this.eventHandler.onVoiceStateUpdate(oldMember, newMember);
  };
}
