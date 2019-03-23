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
    if (this.discordMessage.member.voiceChannel) {
      await this.discordMessage.member.voiceChannel.join();
      return this.discordMessage.member.voiceChannel.id;
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

  public isAdmin(): boolean {
    const adminRole = this.discordMessage.guild.roles.find(
      role => role.name === "Admin"
    );
    if (adminRole === null || adminRole.id === null) {
      return false;
    }
    return this.discordMessage.member.roles.has(adminRole.id);
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
    if (!this.canCollectMessages()) {
      return;
    }
    activeCollectors.addNewActiveCollector(authorId);
    const collector = this.discordMessage.author.dmChannel.createMessageCollector(
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
