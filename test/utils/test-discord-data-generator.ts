import Author from "@model/base/author";
import Message from "@model/base/message";
import Server from "@model/base/server";
import { CustomCommand } from "@store/models/custom-command";
import {
  Collection,
  Emoji,
  Guild,
  GuildChannel,
  Message as DiscordMessage,
  MessageReaction,
  TextChannel,
  User
} from "discord.js";
import * as TypeMoq from "typemoq";
import testDataGenerator from "./test-data-generator";

class TestDiscordMockGenerator {
  private static TEST_EMOJI_ID = "emoji id";
  private static TEST_EMOJI_NAME = "emoji name";
  private static TEST_CHANNEL_NAME = "channel name";

  public generateMockAuthor(partial: Partial<Author>): TypeMoq.IMock<User> {
    const author = testDataGenerator.generateTestAuthor();
    const mock = TypeMoq.Mock.ofType<User>();
    mock.setup(a => a.username).returns(() => partial.name || author.name);
    mock.setup(a => a.bot).returns(() => partial.isBot || author.isBot);
    return mock;
  }

  public generateMockGuild(
    partial: Partial<Server>,
    guildEmojis: Collection<string, Emoji> = new Collection()
  ): TypeMoq.IMock<Guild> {
    const server = testDataGenerator.generateTestServer();
    const mock = TypeMoq.Mock.ofType<Guild>();
    mock.setup(g => g.id).returns(() => partial.id || server.id);
    const channels = new Collection<string, GuildChannel>();
    mock.setup(g => g.channels).returns(() => channels);
    mock.setup(g => g.emojis).returns(() => guildEmojis);
    return mock;
  }

  public generateMockMessage(
    partial: Partial<Message>,
    guildEmojis: Collection<string, Emoji> = new Collection(),
    reactions: Collection<string, MessageReaction> = new Collection()
  ): TypeMoq.IMock<DiscordMessage> {
    const message = testDataGenerator.generateTestMessage();
    const mock = TypeMoq.Mock.ofType<DiscordMessage>();
    mock
      .setup(m => m.author)
      .returns(() => this.generateMockAuthor(partial.author || {}).object);
    mock
      .setup(m => m.guild)
      .returns(
        () => this.generateMockGuild(partial.server || {}, guildEmojis).object
      );
    mock
      .setup(m => m.content)
      .returns(() => partial.message || message.message);
    mock.setup(m => m.reactions).returns(() => reactions);
    return mock;
  }

  public generateMockEmoji(partial: Partial<Emoji>): TypeMoq.IMock<Emoji> {
    const mock = TypeMoq.Mock.ofType<Emoji>();
    mock
      .setup(e => e.id)
      .returns(() => partial.id || TestDiscordMockGenerator.TEST_EMOJI_ID);
    mock
      .setup(e => e.name)
      .returns(() => partial.name || TestDiscordMockGenerator.TEST_EMOJI_NAME);
    return mock;
  }

  public generateMockTextChannel(
    partial: Partial<TextChannel>
  ): TypeMoq.IMock<TextChannel> {
    const mock = TypeMoq.Mock.ofType<TextChannel>();
    mock
      .setup(t => t.name)
      .returns(
        () => partial.name || TestDiscordMockGenerator.TEST_CHANNEL_NAME
      );
    return mock;
  }
}

export default new TestDiscordMockGenerator();
