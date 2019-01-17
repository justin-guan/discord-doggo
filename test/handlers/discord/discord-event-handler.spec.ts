const mockOnReadyHandler = jest.fn();
const mockOnMessageHandler = jest.fn();
const mockOnVoiceStateUpdateHandler = jest.fn();
const mockEventHandlerInitialize = jest.fn();
const mockEventHandlerDestroy = jest.fn();
const mockEventHandler = jest.fn().mockImplementation(() => ({
  initialize: mockEventHandlerInitialize,
  destroy: mockEventHandlerDestroy,
  onReady: mockOnReadyHandler,
  onMessage: mockOnMessageHandler,
  onVoiceStateUpdate: mockOnVoiceStateUpdateHandler
}));
jest.mock("@handlers/base/event-handler", () => {
  return mockEventHandler;
});

import DiscordEventHandler from "@handlers/discord/discord-event-handler";
import { DiscordMessageSender } from "@messenger/discord/discord-message-sender";
import DiscordMessageImpl from "@model/discord/discord-message-impl";
import {
  Client,
  GuildMember,
  Message as DiscordMessage,
  User
} from "discord.js";
import * as TypeMoq from "typemoq";

describe("Discord Event Handler", () => {
  let handler: DiscordEventHandler;
  const testMessageContent = "Test Message";
  const testAuthorName = "Test Author";

  beforeEach(() => {
    handler = new DiscordEventHandler(createMockClient().object);
    mockEventHandlerInitialize.mockImplementation(() => {
      return Promise.resolve();
    });
    mockEventHandlerDestroy.mockImplementation(() => {
      return Promise.resolve();
    });
  });

  afterEach(() => {
    resetMocks();
  });

  describe("non events", () => {
    const testStoreUri = "test store uri";

    test("should initialize the event handler", async () => {
      const result = handler.initialize(testStoreUri);

      await expect(result).resolves.toBeUndefined();
      expect(mockEventHandlerInitialize).toBeCalledWith(testStoreUri);
      expect(mockEventHandlerInitialize).toBeCalledTimes(1);
    });

    test("should fail to initialize the event handler", async () => {
      const testError = new Error();
      mockEventHandlerInitialize.mockImplementation(() => {
        return Promise.reject(testError);
      });

      const result = handler.initialize(testStoreUri);

      await expect(result).rejects.toBe(testError);
      expect(mockEventHandlerInitialize).toBeCalledWith(testStoreUri);
      expect(mockEventHandlerInitialize).toBeCalledTimes(1);
    });

    test("should destroy the event handler", async () => {
      const result = handler.destroy();

      await expect(result).resolves.toBeUndefined();
      expect(mockEventHandlerDestroy).toBeCalledTimes(1);
    });

    test("should fail to destroy the event handler", async () => {
      const testError = new Error();
      mockEventHandlerDestroy.mockImplementation(() => {
        return Promise.reject(testError);
      });

      const result = handler.destroy();

      await expect(result).rejects.toBe(testError);
      expect(mockEventHandlerDestroy).toBeCalledTimes(1);
    });
  });

  describe("on Ready event", () => {
    test("should forward the ready event to base event handler", () => {
      handler.onReady();

      expect(mockOnReadyHandler).toBeCalledTimes(1);
    });
  });

  describe("on Message event", () => {
    test("should forward the message event to base event handler and succeed handling", async () => {
      const mockDiscordMessage = createMockDiscordMessage(createMockUser());
      mockOnMessageHandler.mockImplementation(() => Promise.resolve());

      const onMessageResult = handler.onMessage(mockDiscordMessage.object);

      assertOnMessageHandler(mockOnMessageHandler);
      await expect(onMessageResult).resolves.toBeUndefined();
    });

    test("should forward the message event to base event handler and fail handling", async () => {
      const error = new Error();
      const mockDiscordMessage = createMockDiscordMessage(createMockUser());
      mockOnMessageHandler.mockImplementation(() => Promise.reject(error));

      const onMessageResult = handler.onMessage(mockDiscordMessage.object);

      assertOnMessageHandler(mockOnMessageHandler);
      await expect(onMessageResult).rejects.toBe(error);
    });

    function assertOnMessageHandler(mock: jest.Mock<{}>): void {
      expect(mock).toBeCalledTimes(1);
      expect(mock).toBeCalledWith(
        expect.any(DiscordMessageSender),
        expect.any(DiscordMessageImpl)
      );
    }

    function createMockUser(): TypeMoq.IMock<User> {
      const mockUser = TypeMoq.Mock.ofType<User>();
      mockUser.setup(u => u.username).returns(() => testAuthorName);
      mockUser.setup(u => u.bot).returns(() => false);
      return mockUser;
    }

    function createMockDiscordMessage(
      mockUser: TypeMoq.IMock<User>
    ): TypeMoq.IMock<DiscordMessage> {
      const mockDiscordMessage = TypeMoq.Mock.ofType<DiscordMessage>();
      mockDiscordMessage
        .setup(m => m.content)
        .returns(() => testMessageContent);
      mockDiscordMessage.setup(m => m.author).returns(() => mockUser.object);
      return mockDiscordMessage;
    }
  });

  describe("on Voice State Update", () => {
    test("should forward the member update to event handler", async () => {
      const id = "id";
      const oldVoiceId = "old voice id";
      const newVoiceId = "new voice id";
      const oldMember = createMockMember(id, oldVoiceId);
      const newMember = createMockMember(id, newVoiceId);
      mockOnVoiceStateUpdateHandler.mockImplementation(() => Promise.resolve());

      const result = handler.onVoiceStateUpdate(
        oldMember.object,
        newMember.object
      );

      await expect(result).resolves.toBeUndefined();
    });

    test("should forward the member update to event handler and fail", async () => {
      const id = "id";
      const oldVoiceId = "old voice id";
      const newVoiceId = "new voice id";
      const oldMember = createMockMember(id, oldVoiceId);
      const newMember = createMockMember(id, newVoiceId);
      const testError = new Error();
      mockOnVoiceStateUpdateHandler.mockImplementation(() =>
        Promise.reject(testError)
      );

      const result = handler.onVoiceStateUpdate(
        oldMember.object,
        newMember.object
      );

      await expect(result).rejects.toBe(testError);
    });

    function createMockMember(
      id: string,
      voiceId: string
    ): TypeMoq.IMock<GuildMember> {
      const mockMember = TypeMoq.Mock.ofType<GuildMember>();
      mockMember.setup(m => m.id).returns(() => id);
      mockMember.setup(m => m.voiceChannelID).returns(() => voiceId);
      return mockMember;
    }
  });

  function createMockClient(): TypeMoq.IMock<Client> {
    const mockClient = TypeMoq.Mock.ofType<Client>();
    return mockClient;
  }

  function resetMocks(): void {
    mockOnReadyHandler.mockReset();
    mockOnMessageHandler.mockReset();
    mockEventHandlerInitialize.mockReset();
    mockEventHandlerDestroy.mockReset();
  }
});
