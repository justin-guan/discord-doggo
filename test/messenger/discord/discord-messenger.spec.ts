jest.mock("discord.js", () => {
  return {
    Client: class {}
  };
});

import DiscordMessenger from "@messenger/discord/discord-messenger";
import { Client } from "discord.js";

const loginMock = jest.fn();
Client.prototype.login = loginMock;
const onMock = jest.fn();
Client.prototype.on = onMock;
const destroyMock = jest.fn();
Client.prototype.destroy = destroyMock;

const TEST_DISCORD_TOKEN = "test token";
const LOGIN_CALL_AMOUNT = 1;
const LISTENER_SETUP_AMOUNT = 2;
const READY_EVENT = "ready";
const MESSAGE_EVENT = "message";

describe("Discord Messenger", () => {
  beforeEach(() => {
    loginMock.mockReset();
    onMock.mockReset();
    destroyMock.mockReset();
  });

  test("should set up the client listeners and log in", async () => {
    loginMock.mockImplementation(() => {
      return Promise.resolve();
    });

    const result = DiscordMessenger.start(TEST_DISCORD_TOKEN);

    await expect(result).resolves.toBeUndefined();
    assertGoodSetup();
  });

  test("should set up the client listeners and fail to login", async () => {
    const testError = new Error();
    loginMock.mockImplementation(() => {
      return Promise.reject(testError);
    });

    const result = DiscordMessenger.start(TEST_DISCORD_TOKEN);

    await expect(result).rejects.toBe(testError);
    assertGoodSetup();
  });

  test("should destroy client", async () => {
    const result = DiscordMessenger.stop();

    await expect(result).resolves.toBeUndefined();
  });

  test("should fail to destroy client", async () => {
    const testError = new Error();
    destroyMock.mockImplementation(() => {
      return Promise.reject(testError);
    });
    const result = DiscordMessenger.stop();

    await expect(result).rejects.toBe(testError);
  });

  function assertGoodSetup(): void {
    expect(loginMock).toBeCalledTimes(LOGIN_CALL_AMOUNT);
    expect(loginMock).toBeCalledWith(TEST_DISCORD_TOKEN);
    expect(onMock).toBeCalledTimes(LISTENER_SETUP_AMOUNT);
    expect(onMock).toBeCalledWith(READY_EVENT, expect.any(Function));
    expect(onMock).toBeCalledWith(MESSAGE_EVENT, expect.any(Function));
  }
});
