import { MessageSender } from "@messenger/base/message-sender";
import Client from "@model/base/client";
import Message from "@model/base/message";
import { Commands as AdminCommands } from "@store/commands/admin";
import { Commands as BasicCommands } from "@store/commands/basic";
import Command from "@store/commands/command";
import CommandExecutionData from "@store/commands/command-execution-data";
import CommandStore from "@store/commands/command-store";
import Guild from "@store/models/guild";
import DatabaseStore from "@store/mongo/database-store";
import Store from "@store/store";
import * as TypeMoq from "typemoq";
import testDataGenerator from "../../utils/test-data-generator";

describe("Command Store", () => {
  const databaseMock = testDataGenerator.generateTestDatabase();
  const commandStore = new CommandStore(databaseMock);
  const testServerId = "test server id";
  const badCommandName = "NOT A COMMAND";
  const empty = "";
  const allCommands = [...BasicCommands].concat([...AdminCommands]);

  test.each(allCommands.map(command => command.getCommandName()))(
    "should find the %s command",
    async (commandName: string) => {
      const command = await commandStore.getCommand(testServerId, commandName);

      expect(command).not.toBeUndefined();
      const c = command as Command;
      expect(c.getCommandName()).toEqual(commandName);
    }
  );

  test("should fail to find command", async () => {
    const testDatabase = testDataGenerator.generateTestDatabase({
      getGuild: () => Promise.resolve(testDataGenerator.generateTestGuild())
    });
    const cmdStore = new CommandStore(testDatabase);
    const command = await cmdStore.getCommand(testServerId, badCommandName);

    expect(command).toBeUndefined();
  });

  test.each(allCommands.map(command => command.getCommandDescription()))(
    "should not have any empty description",
    (commandDescription: string) => {
      expect(commandDescription).not.toEqual(empty);
    }
  );

  test.each(allCommands)(
    "should fail to execute the command due to invalid arguments",
    async (command: Command) => {
      const testMessage = createTestMessage(true);
      const badData: CommandExecutionData = {
        prefix: "!",
        rawMessage: testMessage,
        store: TypeMoq.Mock.ofType<Store>().object,
        client: TypeMoq.Mock.ofType<Client>().object,
        arguments: createFakeArguments(command.getExpectedNumberArguments() + 1)
      };
      const mockMessageSender: MessageSender = {
        sendMessage: jest.fn(),
        sendSplitMessage: jest.fn(),
        sendDM: jest.fn(),
        replyMessage: jest.fn(),
        getFormattedCustomEmoji: jest.fn()
      };

      const result = command.execute(badData, mockMessageSender);

      await expect(result).resolves.toBeUndefined();
      expect(mockMessageSender.replyMessage).toBeCalledTimes(1);
      expect(mockMessageSender.replyMessage).toBeCalledWith(
        expect.stringContaining("Invalid command usage\nUsage:")
      );
    }
  );

  test.each([...AdminCommands])(
    "should fail to execute the admin command due to not being an admin",
    async (command: Command) => {
      const testMessage = createTestMessage(false);
      const data: CommandExecutionData = {
        prefix: "!",
        rawMessage: testMessage,
        store: TypeMoq.Mock.ofType<Store>().object,
        client: TypeMoq.Mock.ofType<Client>().object,
        arguments: createFakeArguments(command.getExpectedNumberArguments())
      };
      const mockMessageSender: MessageSender = {
        sendMessage: jest.fn(),
        sendSplitMessage: jest.fn(),
        sendDM: jest.fn(),
        replyMessage: jest.fn(),
        getFormattedCustomEmoji: jest.fn()
      };

      const result = command.execute(data, mockMessageSender);

      await expect(result).resolves.toBeUndefined();
      expect(mockMessageSender.replyMessage).toBeCalledTimes(1);
      expect(mockMessageSender.replyMessage).toBeCalledWith(
        expect.stringContaining("You are not an Admin")
      );
    }
  );

  function createFakeArguments(numArguments: number): string[] {
    const argsArray = new Array<string>(numArguments);
    return argsArray.fill("test");
  }

  function createTestMessage(isAdmin: boolean): Message {
    return testDataGenerator.generateTestMessage({
      author: testDataGenerator.generateTestAuthor({
        isAdmin: () => isAdmin
      })
    });
  }
});
