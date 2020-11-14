import Member from "@model/base/member";
import { GuildMember, VoiceState as DiscordVoiceState } from "discord.js";

export default class DiscordMemberImpl implements Member {
  public id: string;
  public voiceChannelId: string;
  private guildMember: GuildMember | null;

  constructor(discordVoiceState: DiscordVoiceState) {
    this.id = discordVoiceState.id;
    this.voiceChannelId = discordVoiceState.channel
      ? discordVoiceState.channel.id
      : "";
    this.guildMember = discordVoiceState.member;
  }

  public getDisplayName(): string {
    if (this.guildMember) {
      return this.guildMember.nickname
        ? this.guildMember.nickname
        : this.guildMember.user.username;
    }
    return "";
  }
}
