import Author from "@model/base/author";
import Message from "@model/base/message";
import Server from "@model/base/server";
import {
  ChannelManager,
  Collection,
  Emoji,
  Guild,
  GuildChannel,
  GuildChannelManager,
  GuildEmoji,
  GuildEmojiManager,
  Message as DiscordMessage,
  MessageReaction,
  ReactionManager,
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
    guildEmojis: Collection<string, GuildEmoji> = new Collection()
  ): TypeMoq.IMock<Guild> {
    const server = testDataGenerator.generateTestServer();
    const mock = TypeMoq.Mock.ofType<Guild>();
    mock.setup(g => g.id).returns(() => partial.id || server.id);
    mock.setup(g => g.channels).returns(() => {
      const mockChannelManager = TypeMoq.Mock.ofType<GuildChannelManager>();
      const channels = new Collection<string, GuildChannel>();
      mockChannelManager.setup(m => m.cache).returns(() => channels);
      return mockChannelManager.object;
    });
    mock.setup(g => g.emojis).returns(() => {
      const mockGuildEmojiManager = TypeMoq.Mock.ofType<GuildEmojiManager>();
      mockGuildEmojiManager.setup(m => m.cache).returns(() => guildEmojis);
      return mockGuildEmojiManager.object;
    });
    return mock;
  }

  public generateMockMessage(
    partial: Partial<Message>,
    guildEmojis: Collection<string, GuildEmoji> = new Collection(),
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
    mock.setup(m => m.reactions).returns(() => {
      const mockReactionManager = TypeMoq.Mock.ofType<ReactionManager>();
      mockReactionManager.setup(m => m.cache).returns(() => reactions);
      return mockReactionManager.object;
    });
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
