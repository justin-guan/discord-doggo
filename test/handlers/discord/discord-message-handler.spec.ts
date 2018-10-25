import { Message } from "@handlers/base/message-handler";
import { DiscordMessageHandler } from "@handlers/discord/discord-message-handler";
import { MessageSender } from "@messenger/base/message-sender";
import * as TypeMoq from "typemoq";

describe("Discord Message Handler", () => {
  let handler: DiscordMessageHandler;
  let mockMessageSender: TypeMoq.IMock<MessageSender>;
  const testMessageContent = "Test Message";
  const testAuthorName = "Test Author";

  beforeEach(() => {
    handler = new DiscordMessageHandler();
    mockMessageSender = TypeMoq.Mock.ofType<MessageSender>();
  });

  describe("Discord send function succeeds", () => {
    beforeEach(() => {
      mockMessageSender
        .setup(s => s.sendMessage(TypeMoq.It.isAnyString()))
        .returns(() => Promise.resolve());
    });

    test("should reply with the same message", async () => {
      const testMessage = createTestMessage(false);

      const result = handler.handleMessage(
        mockMessageSender.object,
        testMessage
      );

      mockMessageSender.verify(
        sender => sender.sendMessage(testMessageContent),
        TypeMoq.Times.once()
      );
      await expect(result).resolves.toBeUndefined();
    });

    test("should not send a response message", async () => {
      const testMessage = createTestMessage(true);

      const result = handler.handleMessage(
        mockMessageSender.object,
        testMessage
      );

      mockMessageSender.verify(
        sender => sender.sendMessage(TypeMoq.It.isAny()),
        TypeMoq.Times.never()
      );
      await expect(result).resolves.toBeUndefined();
    });
  });

  describe("Discord send function fails", () => {
    const testError = new Error("Error");
    beforeEach(() => {
      mockMessageSender
        .setup(s => s.sendMessage(TypeMoq.It.isAnyString()))
        .returns(() => Promise.reject(testError));
    });

    test("should fail to reply", async () => {
      const testMessage = createTestMessage(false);

      const result = handler.handleMessage(
        mockMessageSender.object,
        testMessage
      );

      mockMessageSender.verify(
        sender => sender.sendMessage(TypeMoq.It.isAny()),
        TypeMoq.Times.once()
      );
      await expect(result).rejects.toEqual(testError);
    });

    test("should not send a response message", async () => {
      const testMessage = createTestMessage(true);

      const result = await handler.handleMessage(
        mockMessageSender.object,
        testMessage
      );

      mockMessageSender.verify(
        sender => sender.sendMessage(TypeMoq.It.isAny()),
        TypeMoq.Times.never()
      );
      await expect(result).resolves.toBeUndefined;
    });
  });

  function createTestMessage(userIsBot: boolean): Message {
    return {
      message: testMessageContent,
      author: {
        name: testAuthorName,
        isBot: userIsBot
      }
    };
  }
});
