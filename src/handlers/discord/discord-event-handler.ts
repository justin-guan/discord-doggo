import EventHandler from "@handlers/base/event-handler";
import ClientImpl from "@handlers/discord/client-impl";
import MemberImpl from "@handlers/discord/member-impl";
import { DiscordMessageSender } from "@messenger/discord/discord-message-sender";
import Message from "@model/message";
import {
  Client as DiscordClient,
  GuildMember,
  Message as DiscordMessage
} from "discord.js";

export default class DiscordEventHandler {
  private eventHandler: EventHandler;

  constructor(client: DiscordClient) {
    this.eventHandler = new EventHandler(new ClientImpl(client));
  }

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
    const sender = new DiscordMessageSender(discordMessage);
    const message: Message = {
      serverId: discordMessage.guild.id,
      message: discordMessage.content,
      author: {
        name: discordMessage.author.username,
        isBot: discordMessage.author.bot
      }
    };
    await this.eventHandler.onMessage(sender, message);
  };

  public onVoiceStateUpdate = async (
    oldGuildMember: GuildMember,
    newGuildMember: GuildMember
  ): Promise<void> => {
    const oldMember = new MemberImpl(oldGuildMember);
    const newMember = new MemberImpl(newGuildMember);
    await this.eventHandler.onVoiceStateUpdate(oldMember, newMember);
  };
}
