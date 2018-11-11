jest.mock("discord.js", () => {
  return {
    Client: class {}
  };
});

import DiscordEventHandler from "@handlers/discord/discord-event-handler";
import { LoginInfo } from "@messenger/base/messenger";
import DiscordMessenger from "@messenger/discord/discord-messenger";
import { Client } from "discord.js";

const loginMock = jest.fn();
Client.prototype.login = loginMock;
const onMock = jest.fn();
Client.prototype.on = onMock;
const clientDestroyMock = jest.fn();
Client.prototype.destroy = clientDestroyMock;
const eventHandlerInitializeMock = jest.fn();
DiscordEventHandler.prototype.initialize = eventHandlerInitializeMock;
const eventHandlerDestroyMock = jest.fn();
DiscordEventHandler.prototype.destroy = eventHandlerDestroyMock;

const LOGIN_CALL_AMOUNT = 1;
const LISTENER_SETUP_AMOUNT = 2;
const READY_EVENT = "ready";
const MESSAGE_EVENT = "message";
const TEST_LOGIN_INFO: LoginInfo = {
  messengerToken: "test token",
  databaseUrl: ""
};

describe("Discord Messenger", () => {
  afterEach(() => {
    resetMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test("should set up the client listeners and log in", async () => {
    loginMock.mockImplementation(() => {
      return Promise.resolve();
    });
    eventHandlerInitializeMock.mockImplementation(() => {
      return Promise.resolve();
    });

    const result = DiscordMessenger.start(TEST_LOGIN_INFO);

    await expect(result).resolves.toBeUndefined();
    assertGoodClientSetup();
  });

  test("should set up the client listeners and fail to login", async () => {
    const testError = new Error();
    loginMock.mockImplementation(() => {
      return Promise.reject(testError);
    });

    const result = DiscordMessenger.start(TEST_LOGIN_INFO);

    await expect(result).rejects.toBe(testError);
    assertGoodClientSetup();
  });

  test("should set up listeners and login but fail to initialize event handler", async () => {
    const testError = new Error();
    loginMock.mockImplementation(() => {
      return Promise.resolve();
    });
    eventHandlerInitializeMock.mockImplementation(() => {
      return Promise.reject(testError);
    });

    const result = DiscordMessenger.start(TEST_LOGIN_INFO);

    await expect(result).rejects.toBe(testError);
    assertGoodClientSetup();
  });

  test("should destroy client and event handlers", async () => {
    const result = DiscordMessenger.stop();

    await expect(result).resolves.toBeUndefined();
  });

  test("should fail to destroy client", async () => {
    const testError = new Error();
    clientDestroyMock.mockImplementation(() => {
      return Promise.reject(testError);
    });

    const result = DiscordMessenger.stop();

    await expect(result).rejects.toBe(testError);
  });

  test("should fail to destroy event handler", async () => {
    const testError = new Error();
    eventHandlerDestroyMock.mockImplementation(() => {
      return Promise.reject(testError);
    });

    const result = DiscordMessenger.stop();

    await expect(result).rejects.toBe(testError);
  });

  function resetMocks(): void {
    loginMock.mockReset();
    onMock.mockReset();
    clientDestroyMock.mockReset();
    eventHandlerInitializeMock.mockReset();
    clientDestroyMock.mockReset();
  }

  function assertGoodClientSetup(): void {
    expect(loginMock).toBeCalledTimes(LOGIN_CALL_AMOUNT);
    expect(loginMock).toBeCalledWith(TEST_LOGIN_INFO.messengerToken);
    expect(onMock).toBeCalledTimes(LISTENER_SETUP_AMOUNT);
    expect(onMock).toBeCalledWith(READY_EVENT, expect.any(Function));
    expect(onMock).toBeCalledWith(MESSAGE_EVENT, expect.any(Function));
  }
});
