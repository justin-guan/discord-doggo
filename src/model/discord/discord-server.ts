import Server from "@model/base/server";
import TextChannel from "@model/base/text-channel";
import DiscordTextChannel from "@model/discord/discord-text-channel";
import { Guild, TextChannel as DiscordTC } from "discord.js";

export default class DiscordServer implements Server {
  private guild: Guild | null;

  constructor(guild: Guild | null) {
    this.guild = guild;
  }

  public get id(): string {
    return this.guild ? this.guild.id : "";
  }

  public get name(): string {
    return this.guild ? this.guild.name : "";
  }

  public get textChannels(): TextChannel[] {
    return this.guild
      ? this.guild.channels.cache
          .filter(c => c instanceof DiscordTC)
          .map(c => new DiscordTextChannel(c as DiscordTC))
      : [];
  }
}
