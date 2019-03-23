import Author from "@model/base/author";
import { EmojiCounter } from "@model/base/emoji-counter";
import Message from "@model/base/message";
import Server from "@model/base/server";
import TextChannel from "@model/base/text-channel";
import { Database } from "@store/base/database";
import { CustomCommand, CustomCommandType } from "@store/models/custom-command";
import Guild from "@store/models/guild";

class TestDataGenerator {
  public static testMessageId = "test message id";
  public static testMessageContent = "test message content";
  public static testMessageIsDM = false;
  public static testMessageEmojiCount = new Map<string, EmojiCounter>();
  public static testAuthorIsBot = false;
  public static testAuthorName = "author name";
  public static testAuthorIsAdmin = false;
  public static testServerId = "test server id";
  public static testServerName = "test server name";
  public static testServerTextChannels = [];
  public static testTextChannelName = "text channel name";
  public static testCommandPrefix = "!";
  public static testCustomCommandName = "test";
  public static testCustomCommandDescription = "description";

  public generateTestAuthor(partial: Partial<Author> = {}): Author {
    return {
      isBot: partial.isBot || TestDataGenerator.testAuthorIsBot,
      name: partial.name || TestDataGenerator.testAuthorName,
      joinCurrentVoiceChannel: partial.joinCurrentVoiceChannel || jest.fn(),
      leaveCurrentVoiceChannel: partial.leaveCurrentVoiceChannel || jest.fn(),
      isAdmin: partial.isAdmin || (() => TestDataGenerator.testAuthorIsAdmin),
      canCollectMessages: partial.canCollectMessages || (() => true),
      collectMessages: partial.collectMessages || jest.fn()
    };
  }

  public generateTestServer(partial: Partial<Server> = {}): Server {
    return {
      id: partial.id || TestDataGenerator.testServerId,
      name: partial.name || TestDataGenerator.testServerName,
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
      attachments: partial.attachments || [],
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

  public generateTestDatabase(partial: Partial<Database> = {}): Database {
    return {
      connect: partial.connect || jest.fn(),
      close: partial.close || jest.fn(),
      getAllGuilds: partial.getAllGuilds || jest.fn(),
      getGuild: partial.getGuild || jest.fn()
    };
  }

  public generateTestGuild(partial: Partial<Guild> = {}): Guild {
    return {
      getId: partial.getId || (() => TestDataGenerator.testServerId),
      getCommandPrefix:
        partial.getCommandPrefix || (() => TestDataGenerator.testCommandPrefix),
      setCommandPrefix: partial.setCommandPrefix || jest.fn(),
      save: partial.save || jest.fn(),
      addNewCustomCommand: partial.addNewCustomCommand || jest.fn(),
      removeCustomCommand: partial.removeCustomCommand || jest.fn(),
      getCustomCommand: partial.getCustomCommand || (() => undefined),
      getAllCustomCommands: partial.getAllCustomCommands || (() => [])
    };
  }

  public generateCustomCommand(
    partial: Partial<CustomCommand> = {}
  ): CustomCommand {
    return {
      name: partial.name || TestDataGenerator.testCustomCommandName,
      description:
        partial.description || TestDataGenerator.testCustomCommandDescription,
      type: partial.type || CustomCommandType.VOICE,
      action: partial.action || "",
      cost: partial.cost || 0
    };
  }
}

export default new TestDataGenerator();
