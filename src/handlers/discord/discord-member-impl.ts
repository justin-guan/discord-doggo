import Member from "@model/member";
import { GuildMember } from "discord.js";

export default class DiscordMemberImpl implements Member {
  public id: string;
  public voiceChannelId: string;
  private guildMember: GuildMember;

  constructor(guildMember: GuildMember) {
    this.id = guildMember.id;
    this.voiceChannelId = guildMember.voiceChannelID;
    this.guildMember = guildMember;
  }

  public getDisplayName(): string {
    return this.guildMember.nickname
      ? this.guildMember.nickname
      : this.guildMember.user.username;
  }
}
