import { MessageSender } from "@messenger/base/message-sender";
import Author from "@model/base/author";
import Message from "@model/base/message";
import { Commands as AdminCommands } from "@store/commands/admin";
import { Commands as BasicCommands } from "@store/commands/basic";
import Command from "@store/commands/command";
import CommandExecutionData from "@store/commands/command-execution-data";
import CommandStore from "@store/commands/command-store";
import Store from "@store/store";
import * as TypeMoq from "typemoq";

describe("Command Store", () => {
  const commandStore = new CommandStore();
  const testServerId = "test server id";
  const badCommandName = "NOT A COMMAND";
  const empty = "";
  const allCommands = [...BasicCommands].concat([...AdminCommands]);

  test.each(allCommands.map(command => command.getCommandName()))(
    "should find the %s command",
    (commandName: string) => {
      const command = commandStore.getCommand(testServerId, commandName);

      expect(command).not.toBeUndefined();
      const c = command as Command;
      expect(c.getCommandName()).toEqual(commandName);
    }
  );

  test("should fail to find command", () => {
    const command = commandStore.getCommand(testServerId, badCommandName);

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
        arguments: createFakeArguments(command.getExpectedNumberArguments() + 1)
      };
      const mockMessageSender: MessageSender = {
        sendMessage: jest.fn(),
        sendSplitMessage: jest.fn(),
        replyMessage: jest.fn()
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
        arguments: createFakeArguments(command.getExpectedNumberArguments())
      };
      const mockMessageSender: MessageSender = {
        sendMessage: jest.fn(),
        sendSplitMessage: jest.fn(),
        replyMessage: jest.fn()
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
    return {
      serverId: "",
      message: "",
      author: {
        isBot: false,
        name: "",
        joinCurrentVoiceChannel: jest.fn(),
        leaveCurrentVoiceChannel: jest.fn(),
        isAdmin: () => isAdmin
      }
    };
  }
});
