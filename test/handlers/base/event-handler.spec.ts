const mockInfoLog = jest.fn();
jest.mock("@logger", () => {
  return { info: mockInfoLog };
});

import EventHandler from "@handlers/base/event-handler";
import { MessageSender } from "@messenger/base/message-sender";
import Message from "@model/message";
import Store from "@store/store";
import * as TypeMoq from "typemoq";

const TEST_STORE_URI = "test store uri";

describe("Event Handler", () => {
  let eventHandler: EventHandler;
  const mockStoreInitialize = jest.fn();
  Store.prototype.initialize = mockStoreInitialize;
  const mockStoreDestroy = jest.fn();
  Store.prototype.destroy = mockStoreDestroy;

  beforeEach(() => {
    eventHandler = new EventHandler();
    mockStoreInitialize.mockImplementation(() => {
      return Promise.resolve();
    });
    mockStoreDestroy.mockImplementation(() => {
      return Promise.resolve();
    });
  });

  afterEach(() => {
    resetMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("non events", () => {
    test("should initialize the data store", async () => {
      const result = eventHandler.initialize(TEST_STORE_URI);

      await expect(result).resolves.toBeUndefined();
      expect(mockStoreInitialize).toBeCalledWith(TEST_STORE_URI);
    });

    test("should fail to initialize the data store", async () => {
      const testError = new Error();
      mockStoreInitialize.mockImplementation(() => {
        return Promise.reject(testError);
      });

      const result = eventHandler.initialize(TEST_STORE_URI);

      await expect(result).rejects.toBe(testError);
      expect(mockStoreInitialize).toBeCalledWith(TEST_STORE_URI);
      expect(mockStoreInitialize).toBeCalledTimes(1);
    });

    test("should destroy the data store", async () => {
      const result = eventHandler.destroy();

      await expect(result).resolves.toBeUndefined();
      expect(mockStoreDestroy).toBeCalledTimes(1);
    });

    test("should fail to destroy the data store", async () => {
      const testError = new Error();
      mockStoreDestroy.mockImplementation(() => {
        return Promise.reject(testError);
      });

      const result = eventHandler.destroy();

      await expect(result).rejects.toBe(testError);
      expect(mockStoreDestroy).toBeCalledTimes(1);
    });
  });

  describe("on Ready event", () => {
    test("should log the client ready event", () => {
      eventHandler.onReady();

      expect(mockInfoLog).toBeCalledTimes(1);
    });
  });

  describe("on Message event", () => {
    let mockMessage: TypeMoq.IMock<Message>;
    const mockMessageSender = TypeMoq.Mock.ofType<MessageSender>();
    const testNotPrefix = "?";
    const testPrefix = "!";
    const testMessage = "!test";

    const mockGetCommandPrefix = jest.fn();
    Store.prototype.getCommandPrefix = mockGetCommandPrefix;
    const mockGetCommand = jest.fn();
    Store.prototype.getCommand = mockGetCommand;
    const mockCommandExecute = jest.fn();

    beforeEach(() => {
      mockMessage = setUpMockMessage(false);
      mockGetCommandPrefix.mockImplementation(() => {
        return testPrefix;
      });
      mockGetCommand.mockImplementation(() => {
        return {
          execute: mockCommandExecute
        };
      });
      mockCommandExecute.mockImplementation(() => {
        return Promise.resolve();
      });
    });

    afterEach(() => {
      resetOnMessageMocks();
    });

    test("should execute command triggered by message", async () => {
      const result = eventHandler.onMessage(
        mockMessageSender.object,
        mockMessage.object
      );

      await expect(result).resolves.toBeUndefined();
      expect(mockCommandExecute).toBeCalledTimes(1);
      expect(mockCommandExecute).toBeCalledWith(
        expect.objectContaining({
          trigger: testPrefix,
          rawMessage: mockMessage.object
        }),
        mockMessageSender.object
      );
    });

    test("should not respond to a bot", async () => {
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

    test("should not trigger a command", async () => {
      mockGetCommandPrefix.mockImplementation(() => {
        return testNotPrefix;
      });

      const result = eventHandler.onMessage(
        mockMessageSender.object,
        mockMessage.object
      );

      await expect(result).resolves.toBeUndefined();
      expect(mockGetCommand).not.toBeCalled();
      expect(mockCommandExecute).not.toBeCalled();
    });

    test("should trigger a command and fail", async () => {
      const testError = new Error();
      mockCommandExecute.mockImplementation(() => {
        return Promise.reject(testError);
      });

      const result = eventHandler.onMessage(
        mockMessageSender.object,
        mockMessage.object
      );

      await expect(result).rejects.toBe(testError);
      expect(mockCommandExecute).toBeCalledTimes(1);
      expect(mockCommandExecute).toBeCalledWith(
        expect.objectContaining({
          trigger: testPrefix,
          rawMessage: mockMessage.object
        }),
        mockMessageSender.object
      );
    });

    test("should not find a command to trigger", async () => {
      mockGetCommand.mockImplementation(() => {
        return Promise.resolve(undefined);
      });

      const result = eventHandler.onMessage(
        mockMessageSender.object,
        mockMessage.object
      );

      await expect(result).resolves.toBeUndefined();
      expect(mockCommandExecute).not.toBeCalled();
    });

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

    function resetOnMessageMocks(): void {
      mockGetCommandPrefix.mockReset();
      mockGetCommand.mockReset();
      mockCommandExecute.mockReset();
    }
  });

  function resetMocks(): void {
    mockInfoLog.mockReset();
    mockStoreInitialize.mockReset();
    mockStoreDestroy.mockReset();
  }
});
