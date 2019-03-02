import Author from "@model/base/author";
import { EmojiCounter, EmojiType } from "@model/base/emoji-counter";
import Message from "@model/base/message";
import Server from "@model/base/server";
import DiscordAuthorImpl from "@model/discord/discord-author-impl";
import DiscordCustomEmoji from "@model/discord/discord-custom-emoji";
import DiscordServer from "@model/discord/discord-server";
import { Message as DiscordMessage } from "discord.js";
import emojiRegex from "emoji-regex";

export default class DiscordMessageImpl implements Message {
  private static EMOJI_REGEX = /<:.*?(?=:):[0-9]*>/gm;
  private discordMessage: DiscordMessage;

  constructor(discordMessage: DiscordMessage) {
    this.discordMessage = discordMessage;
  }

  public get id(): string {
    return this.discordMessage.id;
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

  public get isDirectMessage(): boolean {
    return this.discordMessage.guild === null;
  }

  public get emojiCount(): Map<string, EmojiCounter> {
    const map = new Map<string, EmojiCounter>();
    if (!this.discordMessage.author.bot) {
      this.countStandardEmojisIntoMap(map);
      this.countCustomEmojisIntoMap(map);
      this.countReactionsIntoMap(map);
    }
    return map;
  }

  public get server(): Server {
    return new DiscordServer(this.discordMessage.guild);
  }

  public async delete(): Promise<void> {
    await this.discordMessage.delete();
  }

  private countCustomEmojisIntoMap(map: Map<string, EmojiCounter>): void {
    const emojis = this.discordMessage.guild.emojis;
    const matches =
      this.discordMessage.content.match(DiscordMessageImpl.EMOJI_REGEX) || [];
    matches.forEach(emoji => {
      const discordEmoji = new DiscordCustomEmoji(emoji);
      const hasEmoji = emojis.some(e => e.id === discordEmoji.id);
      if (hasEmoji) {
        const emojiCount =
          map.get(discordEmoji.id) ||
          new EmojiCounter(discordEmoji.id, EmojiType.CUSTOM);
        emojiCount.add(1);
        map.set(emojiCount.identifier, emojiCount);
      }
    });
  }

  private countStandardEmojisIntoMap(map: Map<string, EmojiCounter>): void {
    const message = this.discordMessage.content;
    const regex = emojiRegex();
    for (
      let result = regex.exec(message);
      result !== null;
      result = regex.exec(message)
    ) {
      const emojiCount =
        map.get(result[0]) || new EmojiCounter(result[0], EmojiType.UNICODE);
      emojiCount.add(1);
      map.set(emojiCount.identifier, emojiCount);
    }
  }

  private countReactionsIntoMap(map: Map<string, EmojiCounter>): void {
    this.discordMessage.reactions.forEach(reaction => {
      function createNewEmojiCount(): EmojiCounter {
        return reaction.emoji.id !== null
          ? new EmojiCounter(reaction.emoji.id, EmojiType.CUSTOM)
          : new EmojiCounter(reaction.emoji.name, EmojiType.UNICODE);
      }
      const emojiCount = map.get(reaction.emoji.id) || createNewEmojiCount();
      emojiCount.add(reaction.count);
      map.set(emojiCount.identifier, emojiCount);
    });
  }
}
