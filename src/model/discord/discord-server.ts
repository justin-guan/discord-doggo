import Server from "@model/base/server";
import TextChannel from "@model/base/text-channel";
import DiscordTextChannel from "@model/discord/discord-text-channel";
import { Guild, TextChannel as DiscordTC } from "discord.js";

export default class DiscordServer implements Server {
  private guild: Guild;

  constructor(guild: Guild) {
    this.guild = guild;
  }

  public get id(): string {
    return this.guild.id;
  }

  public get textChannels(): TextChannel[] {
    return this.guild.channels
      .filter(c => c instanceof DiscordTC)
      .map(c => new DiscordTextChannel(c as DiscordTC));
  }
}
