import DiscordAuthorImpl from "@model/discord/discord-author-impl";
import { Message, User } from "discord.js";
import * as TypeMoq from "typemoq";

describe("Discord Author Implementation", () => {
  test("should get the name from discord message author", () => {
    const username = "username";
    const isBot = true;
    const mockMessage = createMockMessage(username, isBot);
    const author = new DiscordAuthorImpl(mockMessage.object);

    expect(author.name).toEqual(username);
  });

  test("should get the bot state from discord message author", () => {
    const username = "username";
    const isBot = true;
    const mockMessage = createMockMessage(username, isBot);
    const author = new DiscordAuthorImpl(mockMessage.object);

    expect(author.isBot).toEqual(isBot);
  });

  function createMockAuthor(
    username: string,
    isBot: boolean
  ): TypeMoq.IMock<User> {
    const mock = TypeMoq.Mock.ofType<User>();
    mock.setup(a => a.username).returns(() => username);
    mock.setup(a => a.bot).returns(() => isBot);
    return mock;
  }

  function createMockMessage(
    username: string,
    isBot: boolean
  ): TypeMoq.IMock<Message> {
    const mock = TypeMoq.Mock.ofType<Message>();
    mock
      .setup(m => m.author)
      .returns(() => createMockAuthor(username, isBot).object);
    return mock;
  }
});
