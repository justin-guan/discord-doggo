import { Collection as MockCollection } from "../../mocks/discord.js/collection";

jest.mock("discord.js", () => {
  return {
    Collection: MockCollection
  };
});

import DiscordAuthorImpl from "@model/discord/discord-author-impl";
import DiscordMessageImpl from "@model/discord/discord-message-impl";
import { Collection, GuildEmoji, Message } from "discord.js";
import * as TypeMoq from "typemoq";
import testDataGenerator from "../../utils/test-data-generator";
import testDiscordMockGenerator from "../../utils/test-discord-data-generator";

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

  test("should fetch a count of all the standard emojis", () => {
    const emoji1 = "👋";
    const emoji1Count = 2;
    const emoji2 = "💩";
    const emoji2Count = 1;
    const testString = `${emoji1}${emoji1}${emoji2}`;
    const msgMock = createMockMessage(serverId, username, isBot, testString);

    const discordMessageImpl = new DiscordMessageImpl(msgMock.object);

    const emojiCount = discordMessageImpl.emojiCount;
    const emoji1Counter = emojiCount.get(emoji1);
    if (!emoji1Counter) {
      throw Error("Expected an emoji counter, but none was found");
    }
    expect(emoji1Counter.count).toEqual(emoji1Count);
    const emoji2Counter = emojiCount.get(emoji2);
    if (!emoji2Counter) {
      throw Error("Expected an emoji counter, but none was found");
    }
    expect(emoji2Counter.count).toEqual(emoji2Count);
  });

  test("should fetch a count of all the custom emojis", () => {
    const emojiId = "305818615712579584";
    const testString = `<:ayy:${emojiId}><:ayy:${emojiId}>`;
    const customEmojiCount = 2;
    const guildEmojis = new Collection<string, GuildEmoji>();
    const emojiMock = TypeMoq.Mock.ofType<GuildEmoji>();
    emojiMock.setup(e => e.id).returns(() => emojiId);
    guildEmojis.set(emojiId, emojiMock.object);
    const msgMock = testDiscordMockGenerator.generateMockMessage(
      {
        message: testString
      },
      guildEmojis
    );

    const discordMessageImpl = new DiscordMessageImpl(msgMock.object);

    const emojiCount = discordMessageImpl.emojiCount;
    const emojiCounter = emojiCount.get(emojiId);
    if (!emojiCounter) {
      throw Error("Expected an emoji counter, but none was found");
    }
    expect(emojiCounter.count).toEqual(customEmojiCount);
  });

  function createMockMessage(
    guildId: string,
    user: string,
    bot: boolean,
    content: string
  ): TypeMoq.IMock<Message> {
    return testDiscordMockGenerator.generateMockMessage({
      message: content,
      author: testDataGenerator.generateTestAuthor({
        isBot: bot,
        name: user
      }),
      server: testDataGenerator.generateTestServer({
        id: guildId
      })
    });
  }
});
