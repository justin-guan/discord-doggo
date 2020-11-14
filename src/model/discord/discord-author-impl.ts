import ActiveCollectors from "@model/base/active-collectors";
import Author from "@model/base/author";
import Message from "@model/base/message";
import MessageCollector from "@model/base/message-collector";
import DiscordMessageCollector from "@model/discord/discord-message-collector";
import DiscordMessageImpl from "@model/discord/discord-message-impl";
import { Message as DiscordMessage } from "discord.js";

export default class DiscordAuthorImpl implements Author {
  private discordMessage: DiscordMessage;

  constructor(message: DiscordMessage) {
    this.discordMessage = message;
  }

  public get name(): string {
    return this.discordMessage.author.username;
  }

  public get isBot(): boolean {
    return this.discordMessage.author.bot;
  }

  public async joinCurrentVoiceChannel(): Promise<string> {
    const member = this.discordMessage.member;
    if (member && member.voice.channel) {
      await member.voice.channel.join();
      return member.voice.channel.id;
    } else {
      return Promise.reject();
    }
  }

  public async leaveCurrentVoiceChannel(): Promise<void> {
    const member = this.discordMessage.member;
    if (!member) return Promise.reject();
    const voiceChannel = member.voice.channel;
    if (!voiceChannel) return Promise.reject();
    const clientVoiceManager = this.discordMessage.client.voice;
    const inChannel = clientVoiceManager
      ? clientVoiceManager.connections.some(
          vc => vc.channel.id === voiceChannel.id
        )
      : false;
    if (voiceChannel && inChannel) {
      await voiceChannel.leave();
    } else {
      return Promise.reject();
    }
  }

  public isAdmin(): boolean {
    const guild = this.discordMessage.guild;
    if (!guild) return false;
    const adminRole = guild.roles.cache.find(role => role.name === "Admin");
    if (!adminRole || adminRole === null || adminRole.id === null) {
      return false;
    }
    return this.discordMessage.member
      ? this.discordMessage.member.roles.cache.has(adminRole.id)
      : false;
  }

  public canCollectMessages(): boolean {
    return !ActiveCollectors.getInstance().hasActiveCollector(
      this.discordMessage.author.id
    );
  }

  public collectMessages(
    onMessage: (msg: Message, collector: MessageCollector) => void
  ): void {
    const activeCollectors = ActiveCollectors.getInstance();
    const authorId = this.discordMessage.author.id;
    if (!this.canCollectMessages()) return;
    activeCollectors.addNewActiveCollector(authorId);
    const dmChannel = this.discordMessage.author.dmChannel;
    if (!dmChannel) return;
    const collector = dmChannel.createMessageCollector(
      m => m.author.id === this.discordMessage.author.id
    );
    collector.on("collect", collectedMessage => {
      const message = new DiscordMessageImpl(collectedMessage);
      const msgCollector = new DiscordMessageCollector(collector);
      onMessage(message, msgCollector);
    });
    collector.on("end", () => {
      activeCollectors.removeActiveCollector(authorId);
    });
  }
}
