import DiscordAuthorImpl from "@model/discord/discord-author-impl";
import DiscordMessageImpl from "@model/discord/discord-message-impl";
import { Guild, Message, User } from "discord.js";
import * as TypeMoq from "typemoq";

describe("Discord Message Implementation", () => {
  const serverId = "server id";
  const username = "user name";
  const isBot = false;
  const messageContent = "message";
  let messageMock: TypeMoq.IMock<Message>;
  let mockMessage: Message;

  beforeEach(() => {
    messageMock = createMockMessage(serverId, username, isBot, messageContent);
    mockMessage = messageMock.object;
  });

  test("should get server id from discord message", () => {
    const discordMessageImpl = new DiscordMessageImpl(mockMessage);

    expect(discordMessageImpl.serverId).toEqual(serverId);
  });

  test("should get message content from discord message", () => {
    const discordMessageImpl = new DiscordMessageImpl(mockMessage);

    expect(discordMessageImpl.message).toEqual(messageContent);
  });

  test("should get author from discord message", () => {
    const discordMessageImpl = new DiscordMessageImpl(mockMessage);

    expect(discordMessageImpl.author).toBeInstanceOf(DiscordAuthorImpl);
  });

  function createMockAuthor(user: string, bot: boolean): TypeMoq.IMock<User> {
    const mock = TypeMoq.Mock.ofType<User>();
    mock.setup(a => a.username).returns(() => user);
    mock.setup(a => a.bot).returns(() => bot);
    return mock;
  }

  function createMockGuild(guildId: string): TypeMoq.IMock<Guild> {
    const mock = TypeMoq.Mock.ofType<Guild>();
    mock.setup(g => g.id).returns(() => guildId);
    return mock;
  }

  function createMockMessage(
    guildId: string,
    user: string,
    bot: boolean,
    content: string
  ): TypeMoq.IMock<Message> {
    const mock = TypeMoq.Mock.ofType<Message>();
    mock.setup(m => m.author).returns(() => createMockAuthor(user, bot).object);
    mock.setup(m => m.guild).returns(() => createMockGuild(guildId).object);
    mock.setup(m => m.content).returns(() => content);
    return mock;
  }
});
