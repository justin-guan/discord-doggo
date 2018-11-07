// ignore max classes per file to allow for creating mock implementations
// tslint:disable:max-classes-per-file
const mockDatabaseInitialize = jest.fn();
const mockDatabaseClose = jest.fn();
const mockGetGuild = jest.fn();
jest.mock("@store/mongo/database-store", () => {
  return class {
    public connect = mockDatabaseInitialize;
    public close = mockDatabaseClose;
    public getGuild = mockGetGuild;
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

  function setupMockGuild(): void {
    // ok to ignore any rule because of mock limitations
    // tslint:disable-next-line:no-any
    mockGuild.setup((p: any) => p.then).returns(() => undefined);
  }

  function resetMocks(): void {
    mockDatabaseInitialize.mockReset();
    mockDatabaseClose.mockReset();
    mockGetGuild.mockReset();
    mockGuild.reset();
  }
});
