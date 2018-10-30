const mockOnReadyHandler = jest.fn();
const mockOnMessageHandler = jest.fn();
const mockEventHandler = jest.fn().mockImplementation(() => ({
  onReady: mockOnReadyHandler,
  onMessage: mockOnMessageHandler
}));
jest.mock("@handlers/base/event-handler", () => {
  return mockEventHandler;
});

import DiscordEventHandler from "@handlers/discord/discord-event-handler";
import { DiscordMessageSender } from "@messenger/discord/discord-message-sender";
import Message from "@model/message";
import { Message as DiscordMessage, User } from "discord.js";
import * as TypeMoq from "typemoq";

describe("Discord Event Handler", () => {
  let handler: DiscordEventHandler;
  const testMessageContent = "Test Message";
  const testAuthorName = "Test Author";

  beforeEach(() => {
    handler = new DiscordEventHandler();
    mockOnReadyHandler.mockReset();
    mockOnMessageHandler.mockReset();
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
      expect(mock).toBeCalledWith(expect.any(DiscordMessageSender), {
        message: testMessageContent,
        author: {
          name: testAuthorName,
          isBot: false
        }
      });
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
});
