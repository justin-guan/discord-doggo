import { Collection as MockCollection } from "../../mocks/discord.js/collection";
jest.mock("discord.js", () => {
  return {
    Collection: MockCollection
  };
});

import { DiscordMessageSender } from "@messenger/discord/discord-message-sender";
import {
  Client,
  Collection,
  DMChannel,
  Emoji,
  GroupDMChannel,
  Message,
  TextChannel
} from "discord.js";
import * as TypeMoq from "typemoq";

describe("Discord Message Sender", () => {
  let discordMessageSender: DiscordMessageSender;
  let mockMessage: TypeMoq.IMock<Message>;
  let mockChannel: TypeMoq.IMock<TextChannel | DMChannel | GroupDMChannel>;
  const testMessage = "test";

  beforeEach(() => {
    mockMessage = TypeMoq.Mock.ofType<Message>();
    mockChannel = TypeMoq.Mock.ofType<
      TextChannel | DMChannel | GroupDMChannel
    >();
    mockMessage.setup(m => m.channel).returns(() => {
      return mockChannel.object;
    });
    discordMessageSender = new DiscordMessageSender(mockMessage.object);
  });

  test("should try to send a message", async () => {
    await discordMessageSender.sendMessage(testMessage);

    mockChannel.verify(c => c.send(testMessage), TypeMoq.Times.once());
  });

  test("should try to send a split message", async () => {
    await discordMessageSender.sendSplitMessage([testMessage]);

    mockChannel.verify(
      c => c.send([testMessage], { split: true }),
      TypeMoq.Times.once()
    );
  });

  test("should try to reply to a message", async () => {
    await discordMessageSender.replyMessage(testMessage);

    mockMessage.verify(m => m.reply(testMessage), TypeMoq.Times.once());
  });

  test("should fail to get a custom emoji as a formatted string", () => {
    const testEmojiId = "emoji id";
    const mockClient = TypeMoq.Mock.ofType<Client>();
    mockClient
      .setup(c => c.emojis)
      .returns(() => new Collection<string, Emoji>());
    mockMessage.setup(m => m.client).returns(() => mockClient.object);

    const result = discordMessageSender.getFormattedCustomEmoji(testEmojiId);

    expect(result).toEqual(testEmojiId);
  });

  test("should get a custom emoji as a formatted string", () => {
    const testEmojiId = "emoji id";
    const formattedEmojiString = `<test:${testEmojiId}>`;
    const mockEmoji = TypeMoq.Mock.ofType<Emoji>();
    mockEmoji.setup(e => e.id).returns(() => testEmojiId);
    mockEmoji.setup(e => e.toString()).returns(() => formattedEmojiString);
    const collection = new Collection<string, Emoji>();
    collection.set(testEmojiId, mockEmoji.object);
    const mockClient = TypeMoq.Mock.ofType<Client>();
    mockClient.setup(c => c.emojis).returns(() => collection);
    mockMessage.setup(m => m.client).returns(() => mockClient.object);

    const result = discordMessageSender.getFormattedCustomEmoji(testEmojiId);

    expect(result).toEqual(formattedEmojiString);
  });
});
