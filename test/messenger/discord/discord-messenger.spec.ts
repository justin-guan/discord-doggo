import DiscordMessenger from "@messenger/discord/discord-messenger";
import { Client } from "discord.js";

const loginMock = jest.fn();
Client.prototype.login = loginMock;
const onMock = jest.fn();
Client.prototype.on = onMock;

const TEST_DISCORD_TOKEN = "test token";
const LOGIN_CALL_AMOUNT = 1;
const LISTENER_SETUP_AMOUNT = 2;
const READY_EVENT = "ready";
const MESSAGE_EVENT = "message";

describe("Discord Messenger", () => {
  beforeEach(() => {
    loginMock.mockReset();
    onMock.mockReset();
  });

  test("should set up the client listeners and log in", () => {
    loginMock.mockImplementation(() => {
      return Promise.resolve();
    });

    const result = DiscordMessenger.start(TEST_DISCORD_TOKEN);

    expect(result).resolves.toBeUndefined();
    expect(loginMock).toBeCalledTimes(LOGIN_CALL_AMOUNT);
    expect(loginMock).toBeCalledWith(TEST_DISCORD_TOKEN);
    expect(onMock).toBeCalledTimes(LISTENER_SETUP_AMOUNT);
    expect(onMock).toBeCalledWith(READY_EVENT, expect.any(Function));
    expect(onMock).toBeCalledWith(MESSAGE_EVENT, expect.any(Function));
  });

  test("should set up the client listeners and fail to login", () => {
    loginMock.mockImplementation(() => {
      return Promise.reject(new Error());
    });

    const result = DiscordMessenger.start(TEST_DISCORD_TOKEN);

    expect(result).rejects.toBe(Error);
    expect(loginMock).toBeCalledTimes(LOGIN_CALL_AMOUNT);
    expect(loginMock).toBeCalledWith(TEST_DISCORD_TOKEN);
    expect(onMock).toBeCalledTimes(LISTENER_SETUP_AMOUNT);
    expect(onMock).toBeCalledWith(READY_EVENT, expect.any(Function));
    expect(onMock).toBeCalledWith(MESSAGE_EVENT, expect.any(Function));
  });
});
