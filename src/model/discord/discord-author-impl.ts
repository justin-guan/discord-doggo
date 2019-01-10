import Author from "@model/base/author";
import { Message } from "discord.js";

export default class DiscordAuthorImpl implements Author {
  private discordMessage: Message;

  constructor(message: Message) {
    this.discordMessage = message;
  }

  public get name(): string {
    return this.discordMessage.author.username;
  }

  public get isBot(): boolean {
    return this.discordMessage.author.bot;
  }

  public async joinCurrentVoiceChannel(): Promise<void> {
    if (this.discordMessage.member.voiceChannel) {
      await this.discordMessage.member.voiceChannel.join();
    } else {
      return Promise.reject();
    }
  }

  public async leaveCurrentVoiceChannel(): Promise<void> {
    const voiceChannel = this.discordMessage.member.voiceChannel;
    const inChannel = this.discordMessage.client.voiceConnections.some(
      vc => vc.channel.id === this.discordMessage.member.voiceChannel.id
    );
    if (voiceChannel && inChannel) {
      await this.discordMessage.member.voiceChannel.leave();
    } else {
      return Promise.reject();
    }
  }
}
