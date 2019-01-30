const mockInfoLog = jest.fn();
const mockErrorLog = jest.fn();
jest.mock("@logger", () => {
  return {
    info: mockInfoLog,
    error: mockErrorLog
  };
});

jest.mock("@config", () => {
  return {
    discordToken: "discord token",
    voiceUrl: "voice url",
    mongoDbUrl: "mongo db url"
  };
});

const mockSynthesize = jest.fn();
jest.mock("@handlers/base/voice-synthesizer", () => {
  return class {
    public synthesize = mockSynthesize;
  };
});

import EventHandler from "@handlers/base/event-handler";
import { MessageSender } from "@messenger/base/message-sender";
import Client from "@model/base/client";
import Member from "@model/base/member";
import Message from "@model/base/message";
import Store from "@store/store";
import * as TypeMoq from "typemoq";

const TEST_STORE_URI = "test store uri";
const TEST_CLIENT_ID = "test client id";

describe("Event Handler", () => {
  let eventHandler: EventHandler;
  const mockStoreInitialize = jest.fn();
  Store.prototype.initialize = mockStoreInitialize;
  const mockStoreDestroy = jest.fn();
  Store.prototype.destroy = mockStoreDestroy;
  const mockStoreGetPreviousConnections = jest.fn();
  Store.prototype.getPreviousConnections = mockStoreGetPreviousConnections;
  const mockSaveConnections = jest.fn();
  Store.prototype.saveConnections = mockSaveConnections;
  const mockClient = TypeMoq.Mock.ofType<Client>();

  beforeEach(() => {
    eventHandler = new EventHandler(mockClient.object);
    mockStoreInitialize.mockImplementation(() => {
      return Promise.resolve();
    });
    mockStoreDestroy.mockImplementation(() => {
      return Promise.resolve();
    });
    mockStoreGetPreviousConnections.mockImplementation(() => {
      return Promise.resolve([]);
    });
    mockSaveConnections.mockImplementation(() => {
      return Promise.resolve();
    });
    mockClient.setup(c => c.id).returns(() => TEST_CLIENT_ID);
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
    test("should log the client ready event", async () => {
      const result = eventHandler.onReady();

      await expect(result).resolves.toBeUndefined();
      expect(mockInfoLog).toBeCalledTimes(1);
    });

    test("should reconnect to previous voice channels", async () => {
      const testVoiceChannelId1 = "test voice channel id 1";
      const testVoiceChannelId2 = "test voice channel id 2";
      const testVoiceChannelIds = [testVoiceChannelId1, testVoiceChannelId2];
      mockStoreGetPreviousConnections.mockImplementation(() => {
        return Promise.resolve(testVoiceChannelIds);
      });

      const result = eventHandler.onReady();

      await expect(result).resolves.toBeUndefined();
      expect(mockInfoLog).toBeCalledTimes(1);
      testVoiceChannelIds.forEach(id => {
        mockClient.verify(c => c.joinVoiceChannel(id), TypeMoq.Times.once());
      });
    });

    test("should fail to reconnect to previous voice channels", async () => {
      const testVoiceChannelId1 = "test voice channel id 1";
      const testVoiceChannelId2 = "test voice channel id 2";
      const testVoiceChannelIds = [testVoiceChannelId1, testVoiceChannelId2];
      mockStoreGetPreviousConnections.mockImplementation(() => {
        return Promise.resolve(testVoiceChannelIds);
      });
      mockClient
        .setup(c => c.joinVoiceChannel(TypeMoq.It.isAnyString()))
        .returns(() => Promise.reject());

      const result = eventHandler.onReady();

      await expect(result).rejects.toBeUndefined();
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
          name: "",
          joinCurrentVoiceChannel: () => Promise.resolve(),
          leaveCurrentVoiceChannel: () => Promise.resolve(),
          isAdmin: () => false
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

  describe("on Voice State Update", () => {
    const memberId = "member id";
    const voiceId1 = "voice id 1";
    const voiceId2 = "voice id 2";
    const synthPath = "synth path";

    test("should do nothing for self update", async () => {
      const testVoiceId1 = "test voice id 1";
      const testVoiceId2 = "test voice id 2";
      const oldMember = createMockMember(TEST_CLIENT_ID, testVoiceId1);
      const newMember = createMockMember(TEST_CLIENT_ID, testVoiceId2);

      const result = eventHandler.onVoiceStateUpdate(oldMember, newMember);

      await expect(result).resolves.toBeUndefined();
      mockClient.verify(
        c => c.playFile(TypeMoq.It.isAny(), TypeMoq.It.isAny()),
        TypeMoq.Times.never()
      );
    });

    test("should do nothing for non channel change", async () => {
      const testId = "test id";
      const testVoiceId = "test voice id";
      const member = createMockMember(testId, testVoiceId);

      const result = eventHandler.onVoiceStateUpdate(member, member);

      await expect(result).resolves.toBeUndefined();
      mockClient.verify(
        c => c.playFile(TypeMoq.It.isAny(), TypeMoq.It.isAny()),
        TypeMoq.Times.never()
      );
    });

    test("should announce join", async () => {
      const oldMember = createMockMember(memberId, voiceId1);
      const newMember = createMockMember(memberId, voiceId2);
      mockSynthesize.mockImplementation(() => Promise.resolve(synthPath));
      mockClient.setup(c => c.isInVoiceChannel(voiceId2)).returns(() => true);

      const result = eventHandler.onVoiceStateUpdate(oldMember, newMember);

      await expect(result).resolves.toBeUndefined();
      mockClient.verify(
        c => c.playFile(voiceId2, synthPath),
        TypeMoq.Times.once()
      );
    });

    test("should announce leave", async () => {
      const oldMember = createMockMember(memberId, voiceId1);
      const newMember = createMockMember(memberId, voiceId2);
      mockSynthesize.mockImplementation(() => Promise.resolve(synthPath));
      mockClient.setup(c => c.isInVoiceChannel(voiceId1)).returns(() => true);

      const result = eventHandler.onVoiceStateUpdate(oldMember, newMember);

      await expect(result).resolves.toBeUndefined();
      mockClient.verify(
        c => c.playFile(voiceId1, synthPath),
        TypeMoq.Times.once()
      );
    });

    test("should not announce because bot not in channel changes", async () => {
      const oldMember = createMockMember(memberId, voiceId1);
      const newMember = createMockMember(memberId, voiceId2);
      mockSynthesize.mockImplementation(() => Promise.resolve(synthPath));
      mockClient.setup(c => c.isInVoiceChannel(voiceId1)).returns(() => false);
      mockClient.setup(c => c.isInVoiceChannel(voiceId2)).returns(() => false);

      const result = eventHandler.onVoiceStateUpdate(oldMember, newMember);

      await expect(result).resolves.toBeUndefined();
      mockClient.verify(
        c => c.playFile(TypeMoq.It.isAny(), TypeMoq.It.isAny()),
        TypeMoq.Times.never()
      );
    });

    test("should fail to announce", async () => {
      const oldMember = createMockMember(memberId, voiceId1);
      const newMember = createMockMember(memberId, voiceId2);
      mockSynthesize.mockImplementation(() => Promise.reject(new Error()));
      mockClient.setup(c => c.isInVoiceChannel(voiceId1)).returns(() => true);

      const result = eventHandler.onVoiceStateUpdate(oldMember, newMember);

      await expect(result).resolves.toBeUndefined();
      mockClient.verify(
        c => c.playFile(TypeMoq.It.isAny(), TypeMoq.It.isAny()),
        TypeMoq.Times.never()
      );
      await expect(mockErrorLog).toBeCalledTimes(1);
    });

    function createMockMember(id: string, voiceId: string): Member {
      return {
        id,
        voiceChannelId: voiceId,
        getDisplayName: () => id
      };
    }
  });

  function resetMocks(): void {
    mockInfoLog.mockReset();
    mockErrorLog.mockReset();
    mockStoreInitialize.mockReset();
    mockStoreDestroy.mockReset();
    mockSynthesize.mockReset();
    mockClient.reset();
  }
});
