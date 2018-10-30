const mockInfoLog = jest.fn();
jest.mock("@logger", () => {
  return { info: mockInfoLog };
});

import EventHandler from "@handlers/base/event-handler";
import { MessageSender } from "@messenger/base/message-sender";
import Message from "@model/message";
import * as TypeMoq from "typemoq";

describe("Event Handler", () => {
  let eventHandler: EventHandler;

  beforeEach(() => {
    eventHandler = new EventHandler();
    mockInfoLog.mockReset();
  });

  describe("on Ready event", () => {
    test("should log the client ready event", () => {
      eventHandler.onReady();

      expect(mockInfoLog).toBeCalledTimes(1);
    });
  });

  describe("on Message event", () => {
    let mockMessageSender: TypeMoq.IMock<MessageSender>;
    let mockMessage: TypeMoq.IMock<Message>;
    const testMessage = "test";

    beforeEach(() => {
      mockMessageSender = setUpMockSenderSuccess();
      mockMessage = setUpMockMessage(false);
    });

    test("should send a message back", async () => {
      await eventHandler.onMessage(
        mockMessageSender.object,
        mockMessage.object
      );

      mockMessageSender.verify(
        sender => sender.sendMessage(testMessage),
        TypeMoq.Times.once()
      );
    });

    test("should not send a message back", async () => {
      mockMessage = setUpMockMessage(true);

      await eventHandler.onMessage(
        mockMessageSender.object,
        mockMessage.object
      );

      mockMessageSender.verify(
        sender => sender.sendMessage(testMessage),
        TypeMoq.Times.never()
      );
    });

    test("should try to send a message back and fail", async () => {
      mockMessageSender = setUpMockSenderFailure();

      const messageResult = eventHandler.onMessage(
        mockMessageSender.object,
        mockMessage.object
      );

      mockMessageSender.verify(
        sender => sender.sendMessage(testMessage),
        TypeMoq.Times.once()
      );
      await expect(messageResult).rejects.toBeInstanceOf(Error);
    });

    function createMessageSenderMock(): TypeMoq.IMock<MessageSender> {
      return TypeMoq.Mock.ofType<MessageSender>();
    }

    function setUpMockSenderSuccess(): TypeMoq.IMock<MessageSender> {
      const mock = createMessageSenderMock();
      mock.setup(s => s.sendMessage(TypeMoq.It.isAnyString())).returns(() => {
        return Promise.resolve();
      });
      return mock;
    }

    function setUpMockSenderFailure(): TypeMoq.IMock<MessageSender> {
      const mock = createMessageSenderMock();
      mock.setup(s => s.sendMessage(TypeMoq.It.isAnyString())).returns(() => {
        return Promise.reject(new Error());
      });
      return mock;
    }

    function setUpMockMessage(isBot: boolean): TypeMoq.IMock<Message> {
      const mock = TypeMoq.Mock.ofType<Message>();
      mock.setup(m => m.author).returns(() => {
        return {
          isBot,
          name: ""
        };
      });
      mock.setup(m => m.message).returns(() => {
        return testMessage;
      });
      return mock;
    }
  });
});
