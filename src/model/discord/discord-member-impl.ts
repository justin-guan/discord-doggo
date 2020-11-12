import VoiceState from "@model/base/voicestate";
import { VoiceState as DiscordVoiceState } from "discord.js";

export default class DiscordVoiceStateImpl implements VoiceState {
  public id: string;
  public voiceChannelId: string;
  private discordVoiceState: DiscordVoiceState;

  constructor(discordVoiceState: DiscordVoiceState) {
    this.id = discordVoiceState.id;
    this.voiceChannelId = discordVoiceState.channelID
      ? discordVoiceState.channelID
      : "";
    this.discordVoiceState = discordVoiceState;
  }

  public getDisplayName(): string {
    if (this.discordVoiceState.member) {
      return this.discordVoiceState.member.nickname
        ? this.discordVoiceState.member.nickname
        : this.discordVoiceState.member.user.username;
    }
    return "";
  }
}
