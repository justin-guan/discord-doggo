const mockMongooseConnect = jest.fn();
const mockMongooseConnectionClose = jest.fn();
jest.mock("mongoose", () => {
  return {
    connect: mockMongooseConnect,
    connection: {
      close: mockMongooseConnectionClose
    }
  };
});
const mockGuildSchemaFindAllGuilds = jest.fn();
const mockGuildSchemaFindGuild = jest.fn();
jest.mock("@store/mongo/database-models/guild", () => {
  return {
    Guild: {
      findAllGuilds: mockGuildSchemaFindAllGuilds,
      findGuild: mockGuildSchemaFindGuild
    }
  };
});

import Guild from "@store/models/guild";
import DatabaseStore from "@store/mongo/database-store";

describe("Database Store", () => {
  let databaseStore: DatabaseStore;
  const testDatabaseUri = "test database uri";

  beforeEach(() => {
    databaseStore = new DatabaseStore(); // makes sure cache is cleared by creating new instance
  });

  afterEach(() => {
    resetMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test("should connect to a mongodb instance", async () => {
    mockMongooseConnect.mockImplementation(() => {
      return Promise.resolve();
    });

    const result = databaseStore.connect(testDatabaseUri);

    await expect(result).resolves.toBeUndefined();
    expect(mockMongooseConnect).toBeCalledTimes(1);
    expect(mockMongooseConnect).toBeCalledWith(
      testDatabaseUri,
      expect.objectContaining({
        useNewUrlParser: true
      })
    );
  });

  test("should fail to connect to a mongodb instance", async () => {
    const testError = new Error();
    mockMongooseConnect.mockImplementation(() => {
      return Promise.reject(testError);
    });

    const result = databaseStore.connect(testDatabaseUri);

    await expect(result).rejects.toBe(testError);
    expect(mockMongooseConnect).toBeCalledTimes(1);
    expect(mockMongooseConnect).toBeCalledWith(
      testDatabaseUri,
      expect.objectContaining({
        useNewUrlParser: true
      })
    );
  });

  test("should close the database connection", async () => {
    mockMongooseConnectionClose.mockImplementation(() => {
      return Promise.resolve();
    });

    const result = databaseStore.close();

    await expect(result).resolves.toBeUndefined();
    expect(mockMongooseConnectionClose).toBeCalledTimes(1);
  });

  test("should fail to close the database connection", async () => {
    const testError = new Error();
    mockMongooseConnectionClose.mockImplementation(() => {
      return Promise.reject(testError);
    });

    const result = databaseStore.close();

    await expect(result).rejects.toBe(testError);
    expect(mockMongooseConnectionClose).toBeCalledTimes(1);
  });

  test("should get all guilds", async () => {
    const mockGuild1 = createGuildMock("guild1");
    const mockGuild2 = createGuildMock("guild2");
    mockGuildSchemaFindAllGuilds.mockImplementation(() => {
      return Promise.resolve([mockGuild1, mockGuild2]);
    });

    const result = databaseStore.getAllGuilds();

    await expect(result).resolves.toEqual(
      expect.arrayContaining([mockGuild1, mockGuild2])
    );
    expect(mockGuildSchemaFindAllGuilds).toBeCalledTimes(1);
  });

  test("should fail to get all guilds", async () => {
    const testError = new Error();
    mockGuildSchemaFindAllGuilds.mockImplementation(() => {
      return Promise.reject(testError);
    });

    const result = databaseStore.getAllGuilds();

    await expect(result).rejects.toBe(testError);
    expect(mockGuildSchemaFindAllGuilds).toBeCalledTimes(1);
  });

  test("should get a guild given an id", async () => {
    const guildId = "guild1";
    const mockGuild = createGuildMock(guildId);
    mockGuildSchemaFindGuild.mockImplementation(() => {
      return Promise.resolve(mockGuild);
    });

    const result = databaseStore.getGuild(guildId);

    await expect(result).resolves.toEqual(mockGuild);
    expect(mockGuildSchemaFindGuild).toBeCalledTimes(1);
  });

  test("should get a guild from the cache given an id", async () => {
    const guildId = "guild1";
    const mockGuild = createGuildMock(guildId);
    mockGuildSchemaFindGuild.mockImplementation(() => {
      return Promise.resolve(mockGuild);
    });

    const result1 = await databaseStore.getGuild(guildId);
    const result2 = await databaseStore.getGuild(guildId);

    expect(result1).toEqual(mockGuild);
    expect(result2).toEqual(mockGuild);
    expect(mockGuildSchemaFindGuild).toBeCalledTimes(1);
  });

  test("should fail to get a guild given an id", async () => {
    const guildId = "guild1";
    const testError = new Error();
    mockGuildSchemaFindGuild.mockImplementation(() => {
      return Promise.reject(testError);
    });

    const result = databaseStore.getGuild(guildId);

    expect(result).rejects.toBe(testError);
    expect(mockGuildSchemaFindGuild).toBeCalledTimes(1);
  });

  test("should update the cache when all guilds are fetched", async () => {
    const guildId = "guild1";
    const mockGuild1 = createGuildMock(guildId);
    const mockGuild2 = createGuildMock("guild2");
    mockGuildSchemaFindAllGuilds.mockImplementation(() => {
      return Promise.resolve([mockGuild1, mockGuild2]);
    });

    const getAllGuildsResult = await databaseStore.getAllGuilds();
    const getGuildResult = await databaseStore.getGuild(guildId);

    expect(getAllGuildsResult).toEqual(
      expect.arrayContaining([mockGuild1, mockGuild2])
    );
    expect(getGuildResult).toEqual(mockGuild1);
    expect(mockGuildSchemaFindGuild).not.toBeCalled();
  });

  function resetMocks(): void {
    mockMongooseConnect.mockReset();
    mockMongooseConnectionClose.mockReset();
    mockGuildSchemaFindAllGuilds.mockReset();
    mockGuildSchemaFindGuild.mockReset();
  }

  function createGuildMock(id: string): Guild {
    const guild: Guild = {
      getId: () => id,
      getCommandPrefix: () => "",
      setCommandPrefix: () => undefined,
      save: () => Promise.resolve(guild)
    };
    return guild;
  }
});
