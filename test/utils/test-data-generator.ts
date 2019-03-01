import Author from "@model/base/author";
import { EmojiCount } from "@model/base/emoji-count";
import Message from "@model/base/message";
import Server from "@model/base/server";

class TestDataGenerator {
  public static testMessageId = "test message id";
  public static testMessageContent = "test message content";
  public static testMessageIsDM = false;
  public static testMessageEmojiCount = new Map<string, EmojiCount>();
  public static testAuthorIsBot = false;
  public static testAuthorName = "author name";
  public static testAuthorIsAdmin = false;
  public static testServerId = "test server id";
  public static testServerTextChannels = [];

  public generateTestAuthor(partial: Partial<Author> = {}): Author {
    return {
      isBot: valueOrDefault(partial.isBot, TestDataGenerator.testAuthorIsBot),
      name: valueOrDefault(partial.name, TestDataGenerator.testAuthorName),
      joinCurrentVoiceChannel: valueOrDefault(
        partial.joinCurrentVoiceChannel,
        jest.fn()
      ),
      leaveCurrentVoiceChannel: valueOrDefault(
        partial.leaveCurrentVoiceChannel,
        jest.fn()
      ),
      isAdmin: valueOrDefault(
        partial.isAdmin,
        () => TestDataGenerator.testAuthorIsAdmin
      )
    };
  }

  public generateTestServer(partial: Partial<Server> = {}): Server {
    return {
      id: valueOrDefault(partial.id, TestDataGenerator.testServerId),
      textChannels: valueOrDefault(
        partial.textChannels,
        TestDataGenerator.testServerTextChannels
      )
    };
  }

  public generateTestMessage(partial: Partial<Message> = {}): Message {
    return {
      id: valueOrDefault(partial.id, TestDataGenerator.testMessageId),
      message: valueOrDefault(
        partial.message,
        TestDataGenerator.testMessageContent
      ),
      author: valueOrDefault(partial.author, this.generateTestAuthor()),
      isDirectMessage: valueOrDefault(
        partial.isDirectMessage,
        TestDataGenerator.testMessageIsDM
      ),
      emojiCount: valueOrDefault(
        partial.emojiCount,
        TestDataGenerator.testMessageEmojiCount
      ),
      server: valueOrDefault(partial.server, this.generateTestServer())
    };
  }
}

function valueOrDefault<T>(value: T | undefined, defaultValue: T): T {
  return value ? value : defaultValue;
}

export default new TestDataGenerator();
