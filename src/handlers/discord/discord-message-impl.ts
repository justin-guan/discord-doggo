import DiscordAuthorImpl from "@handlers/discord/discord-author-impl";
import Author from "@model/author";
import Message from "@model/message";
import { Message as DiscordMessage } from "discord.js";

export default class DiscordMessageImpl implements Message {
  private discordMessage: DiscordMessage;

  constructor(discordMessage: DiscordMessage) {
    this.discordMessage = discordMessage;
  }

  public get serverId(): string {
    return this.discordMessage.guild.id;
  }

  public get message(): string {
    return this.discordMessage.content;
  }

  public get author(): Author {
    return new DiscordAuthorImpl(this.discordMessage);
  }
}
