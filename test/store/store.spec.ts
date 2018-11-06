const mockDatabaseInitialize = jest.fn();
const mockDatabaseClose = jest.fn();
jest.mock("@store/mongo/database-store", () => {
  return class {
    public connect = mockDatabaseInitialize;
    public close = mockDatabaseClose;
  };
});
jest.mock("@store/commands/command-store");

import Store from "@store/store";

describe("Store", () => {
  let store: Store;
  const testDatabaseUri = "test database uri";

  beforeEach(() => {
    store = new Store();
    mockDatabaseInitialize.mockImplementation(() => {
      return Promise.resolve();
    });
    mockDatabaseClose.mockImplementation(() => {
      return Promise.resolve();
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

  function resetMocks(): void {
    mockDatabaseInitialize.mockReset();
    mockDatabaseClose.mockReset();
  }
});
