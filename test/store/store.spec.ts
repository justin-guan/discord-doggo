// ignore max classes per file to allow for creating mock implementations
// tslint:disable:max-classes-per-file
const mockDatabaseInitialize = jest.fn();
const mockDatabaseClose = jest.fn();
const mockGetGuild = jest.fn();
const mockGetPreviousConnections = jest.fn();
const mockSaveConnections = jest.fn();
jest.mock("@store/mongo/database-store", () => {
  return class {
    public connect = mockDatabaseInitialize;
    public close = mockDatabaseClose;
    public getGuild = mockGetGuild;
    public getPreviousConnections = mockGetPreviousConnections;
    public saveConnections = mockSaveConnections;
  };
});
const mockGetCommand = jest.fn();
jest.mock("@store/commands/command-store", () => {
  return class {
    public getCommand = mockGetCommand;
  };
});

import Command from "@store/commands/command";
import Guild from "@store/models/guild";
import Store from "@store/store";
import * as TypeMoq from "typemoq";
import testDataGenerator from "../utils/test-data-generator";

describe("Store", () => {
  let store: Store;
  const testDatabaseUri = "test database uri";
  const testCommandPrefix = "!";
  const testServerId = "test server id";
  const testCommandName = "test command name";
  const mockGuild = TypeMoq.Mock.ofType<Guild>();

  beforeEach(() => {
    store = new Store();
    setupMockGuild();
    mockDatabaseInitialize.mockImplementation(() => {
      return Promise.resolve();
    });
    mockDatabaseClose.mockImplementation(() => {
      return Promise.resolve();
    });
    mockGetGuild.mockImplementation(() => {
      return Promise.resolve(mockGuild.object);
    });
  });

  afterEach(() => {
    resetMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test("should initialize the data store", async () => {
    const result = store.initialize(testDatabaseUri);

    await expect(result).resolves.toBeUndefined();
    expect(mockDatabaseInitialize).toBeCalledWith(testDatabaseUri);
    expect(mockDatabaseInitialize).toBeCalledTimes(1);
  });

  test("should fail to initialize the data store", async () => {
    const testError = new Error();
    mockDatabaseInitialize.mockImplementation(() => {
      return Promise.reject(testError);
    });

    const result = store.initialize(testDatabaseUri);

    await expect(result).rejects.toBe(testError);
    expect(mockDatabaseInitialize).toBeCalledWith(testDatabaseUri);
    expect(mockDatabaseInitialize).toBeCalledTimes(1);
  });

  test("should destroy the data store", async () => {
    const result = store.destroy();

    await expect(result).resolves.toBeUndefined();
    expect(mockDatabaseClose).toBeCalledTimes(1);
  });

  test("should fail to destroy the data store", async () => {
    const testError = new Error();
    mockDatabaseClose.mockImplementation(() => {
      return Promise.reject(testError);
    });

    const result = store.destroy();

    await expect(result).rejects.toBe(testError);
    expect(mockDatabaseClose).toBeCalledTimes(1);
  });

  test("should update the command prefix", async () => {
    mockGuild
      .setup(g => g.save())
      .returns(() => Promise.resolve(mockGuild.object));
    const result = store.updateCommandPrefix({
      newPrefix: testCommandPrefix,
      serverId: testServerId
    });

    await expect(result).resolves.toBeUndefined();
    mockGuild.verify(
      g => g.setCommandPrefix(testCommandPrefix),
      TypeMoq.Times.once()
    );
    mockGuild.verify(g => g.save(), TypeMoq.Times.once());
  });

  test("should fail to get the guild to update the command prefix", async () => {
    const testError = new Error();
    mockGetGuild.mockImplementation(() => {
      return Promise.reject(testError);
    });

    const result = store.updateCommandPrefix({
      newPrefix: testCommandPrefix,
      serverId: testServerId
    });

    await expect(result).rejects.toBe(testError);
    mockGuild.verify(
      g => g.setCommandPrefix(TypeMoq.It.isAnyString()),
      TypeMoq.Times.never()
    );
    mockGuild.verify(g => g.save(), TypeMoq.Times.never());
  });

  test("should fail to save the command prefix", async () => {
    const testError = new Error();
    mockGuild.setup(g => g.save()).returns(() => Promise.reject(testError));

    const result = store.updateCommandPrefix({
      newPrefix: testCommandPrefix,
      serverId: testServerId
    });

    await expect(result).rejects.toBe(testError);
    mockGuild.verify(
      g => g.setCommandPrefix(testCommandPrefix),
      TypeMoq.Times.once()
    );
    mockGuild.verify(g => g.save(), TypeMoq.Times.once());
  });

  test("should get command prefix for a guild", async () => {
    mockGuild.setup(g => g.getCommandPrefix()).returns(() => testCommandPrefix);

    const result = store.getCommandPrefix(testServerId);

    await expect(result).resolves.toEqual(testCommandPrefix);
    expect(mockGetGuild).toBeCalledTimes(1);
    expect(mockGetGuild).toBeCalledWith(testServerId);
    mockGuild.verify(g => g.getCommandPrefix(), TypeMoq.Times.once());
  });

  test("should fail to get the guild when trying to get command prefix", async () => {
    const testError = new Error();
    mockGetGuild.mockImplementation(() => {
      return Promise.reject(testError);
    });

    const result = store.getCommandPrefix(testServerId);

    await expect(result).rejects.toBe(testError);
    expect(mockGetGuild).toBeCalledTimes(1);
    expect(mockGetGuild).toBeCalledWith(testServerId);
    mockGuild.verify(g => g.getCommandPrefix(), TypeMoq.Times.never());
  });

  test("should find a command given a command name that exists", async () => {
    mockGetCommand.mockImplementation(() => {
      return TypeMoq.Mock.ofType<Command>().object;
    });

    const command = store.getCommand(testServerId, testCommandName);

    expect(command).not.toBeUndefined();
  });

  test("should not find a command given a command name that exists", async () => {
    mockGetCommand.mockImplementation(() => {
      return undefined;
    });

    const command = store.getCommand(testServerId, testCommandName);

    expect(command).toBeUndefined();
  });

  test("should get previous connections", async () => {
    const testVoiceChannelId = "test voice channel id";
    mockGetPreviousConnections.mockImplementation(() => {
      return Promise.resolve([testVoiceChannelId]);
    });

    const result = store.getPreviousConnections();

    await expect(result).resolves.toEqual([testVoiceChannelId]);
  });

  test("should fail to get previous connections", async () => {
    mockGetPreviousConnections.mockImplementation(() => {
      return Promise.reject();
    });

    const result = store.getPreviousConnections();

    await expect(result).rejects.toBeUndefined();
  });

  test("should save current connections", async () => {
    mockSaveConnections.mockImplementation(() => {
      return Promise.resolve();
    });

    const result = store.saveConnections([]);

    await expect(result).resolves.toBeUndefined();
  });

  test("should fail to save current connections", async () => {
    mockSaveConnections.mockImplementation(() => {
      return Promise.reject();
    });

    const result = store.saveConnections([]);

    await expect(result).rejects.toBeUndefined();
  });

  test("should add a new custom command", async () => {
    const customCommand = testDataGenerator.generateCustomCommand();
    const result = store.addCustomCommand(testServerId, customCommand);

    await expect(result).resolves.toBeUndefined();
    mockGuild.verify(
      g => g.addNewCustomCommand(customCommand),
      TypeMoq.Times.once()
    );
  });

  test("should fail to add a new custom command", async () => {
    const testError = new Error();
    mockGuild
      .setup(g => g.addNewCustomCommand(TypeMoq.It.isAny()))
      .throws(testError);
    const customCommand = testDataGenerator.generateCustomCommand();
    const result = store.addCustomCommand(testServerId, customCommand);

    await expect(result).rejects.toBe(testError);
  });

  test("should remove a custom command", async () => {
    mockGuild
      .setup(g => g.removeCustomCommand(TypeMoq.It.isAny()))
      .returns(() => true);
    const customCommand = testDataGenerator.generateCustomCommand();
    await store.addCustomCommand(testServerId, customCommand);

    const result = store.removeCustomCommand(testServerId, customCommand.name);

    await expect(result).resolves.toEqual(true);
  });

  test("should not remove a custom command", async () => {
    mockGuild
      .setup(g => g.removeCustomCommand(TypeMoq.It.isAny()))
      .returns(() => false);

    const result = store.removeCustomCommand(testServerId, "");

    await expect(result).resolves.toEqual(false);
  });

  function setupMockGuild(): void {
    // ok to ignore any rule because of mock limitations
    // tslint:disable-next-line:no-any
    mockGuild.setup((p: any) => p.then).returns(() => undefined);
  }

  function resetMocks(): void {
    mockDatabaseInitialize.mockReset();
    mockDatabaseClose.mockReset();
    mockGetGuild.mockReset();
    mockGetPreviousConnections.mockReset();
    mockSaveConnections.mockReset();
    mockGuild.reset();
  }
});
