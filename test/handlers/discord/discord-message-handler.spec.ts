import { Message } from "@handlers/base/message-handler";
import { DiscordMessageHandler } from "@handlers/discord/discord-message-handler";
import { MessageSender } from "@messenger/base/message-sender";
import * as Chai from "chai";
import * as ChaiAsPromised from "chai-as-promised";
import * as TypeMoq from "typemoq";

const expect = Chai.expect;
Chai.use(ChaiAsPromised.default);

describe("Discord Message Handler", () => {
  let handler: DiscordMessageHandler;
  let mockMessageSender: TypeMoq.IMock<MessageSender>;
  const testMessageContent = "Test Message";
  const testAuthorName = "Test Author";

  beforeEach(() => {
    handler = new DiscordMessageHandler();
    mockMessageSender = TypeMoq.Mock.ofType<MessageSender>();
  });

  describe("Promise resolved", () => {
    beforeEach(() => {
      mockMessageSender
        .setup(s => s.sendMessage(TypeMoq.It.isAnyString()))
        .returns(() => Promise.resolve());
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
  });

  describe("Promise rejected", () => {
    beforeEach(() => {
      mockMessageSender
        .setup(s => s.sendMessage(TypeMoq.It.isAnyString()))
        .returns(() => Promise.reject());
    });

    it("should fail to reply", async () => {
      const testMessage = createTestMessage(false);

      const result = handler.handleMessage(
        mockMessageSender.object,
        testMessage
      );

      mockMessageSender.verify(
        sender => sender.sendMessage(TypeMoq.It.isAny()),
        TypeMoq.Times.once()
      );
      return expect(result).to.eventually.rejected;
    });

    it("should not send a response message", async () => {
      const testMessage = createTestMessage(true);

      const result = handler.handleMessage(
        mockMessageSender.object,
        testMessage
      );

      mockMessageSender.verify(
        sender => sender.sendMessage(TypeMoq.It.isAny()),
        TypeMoq.Times.never()
      );
      return expect(result).to.eventually.equal(undefined);
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
