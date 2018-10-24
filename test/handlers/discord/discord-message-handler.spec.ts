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
    const promise: Promise<void> = Promise.resolve();
    mockMessageSender
      .setup(s => s.sendMessage(TypeMoq.It.isAnyString()))
      .returns(() => promise);
  });

  it("should reply with the same message", async () => {
    const testMessage = createTestMessage(false);

    await handler.handleMessage(mockMessageSender.object, testMessage);

    mockMessageSender.verify(
      sender => sender.sendMessage(testMessageContent),
      TypeMoq.Times.once()
    );
  });

  it("should not send a response message", async () => {
    const testMessage = createTestMessage(true);

    await handler.handleMessage(mockMessageSender.object, testMessage);

    mockMessageSender.verify(
      sender => sender.sendMessage(TypeMoq.It.isAny()),
      TypeMoq.Times.never()
    );
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
