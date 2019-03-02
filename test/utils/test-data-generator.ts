import Author from "@model/base/author";
import { EmojiCounter } from "@model/base/emoji-counter";
import Message from "@model/base/message";
import Server from "@model/base/server";
import TextChannel from "@model/base/text-channel";

class TestDataGenerator {
  public static testMessageId = "test message id";
  public static testMessageContent = "test message content";
  public static testMessageIsDM = false;
  public static testMessageEmojiCount = new Map<string, EmojiCounter>();
  public static testAuthorIsBot = false;
  public static testAuthorName = "author name";
  public static testAuthorIsAdmin = false;
  public static testServerId = "test server id";
  public static testServerTextChannels = [];
  public static testTextChannelName = "text channel name";

  public generateTestAuthor(partial: Partial<Author> = {}): Author {
    return {
      isBot: partial.isBot || TestDataGenerator.testAuthorIsBot,
      name: partial.name || TestDataGenerator.testAuthorName,
      joinCurrentVoiceChannel: partial.joinCurrentVoiceChannel || jest.fn(),
      leaveCurrentVoiceChannel: partial.leaveCurrentVoiceChannel || jest.fn(),
      isAdmin: partial.isAdmin || (() => TestDataGenerator.testAuthorIsAdmin)
    };
  }

  public generateTestServer(partial: Partial<Server> = {}): Server {
    return {
      id: partial.id || TestDataGenerator.testServerId,
      textChannels:
        partial.textChannels || TestDataGenerator.testServerTextChannels
    };
  }

  public generateTestMessage(partial: Partial<Message> = {}): Message {
    return {
      id: partial.id || TestDataGenerator.testMessageId,
      message: partial.message || TestDataGenerator.testMessageContent,
      author: partial.author || this.generateTestAuthor(),
      isDirectMessage:
        partial.isDirectMessage || TestDataGenerator.testMessageIsDM,
      emojiCount: partial.emojiCount || TestDataGenerator.testMessageEmojiCount,
      server: partial.server || this.generateTestServer(),
      delete: partial.delete || jest.fn()
    };
  }

  public generateTestTextChannel(
    partial: Partial<TextChannel> = {}
  ): TextChannel {
    return {
      name: partial.name || TestDataGenerator.testTextChannelName,
      getAllMessages: partial.getAllMessages || jest.fn()
    };
  }
}

export default new TestDataGenerator();
