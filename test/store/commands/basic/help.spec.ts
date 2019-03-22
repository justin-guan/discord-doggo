import { MessageSender } from "@messenger/base/message-sender";
import Client from "@model/base/client";
import Message from "@model/base/message";
import Help from "@store/commands/basic/help";
import Command from "@store/commands/command";
import CommandExecutionData from "@store/commands/command-execution-data";
import Store from "@store/store";
import * as TypeMoq from "typemoq";
import testDataGenerator from "../../../utils/test-data-generator";

jest.mock("@store/commands/basic", () => {
  return {
    Commands: new Set<Command>([
      {
        getCommandName: () => "2",
        getCommandDescription: jest.fn(),
        getExpectedNumberArguments: () => 0,
        execute: jest.fn()
      },
      {
        getCommandName: () => "1",
        getCommandDescription: jest.fn(),
        getExpectedNumberArguments: () => 0,
        execute: jest.fn()
      }
    ])
  };
});
jest.mock("@store/commands/admin", () => {
  return {
    Commands: new Set<Command>([
      {
        getCommandName: () => "3",
        getCommandDescription: jest.fn(),
        getExpectedNumberArguments: () => 0,
        execute: jest.fn()
      }
    ])
  };
});
const basicCommandCount = 2;
const adminCommandCount = 1;

describe("Help Command", () => {
  const helpHeaders = 3;
  const help = new Help();
  const helpCommandName = "help";
  const testMessage: Message = testDataGenerator.generateTestMessage();
  const testExecutionData: CommandExecutionData = {
    prefix: "!",
    rawMessage: testMessage,
    store: TypeMoq.Mock.ofType<Store>().object,
    client: TypeMoq.Mock.ofType<Client>().object,
    arguments: []
  };
  const mockMessageSender = TypeMoq.Mock.ofType<MessageSender>();

  afterEach(() => {
    mockMessageSender.reset();
  });

  test("should return help as the command name", () => {
    expect(help.getCommandName()).toEqual(helpCommandName);
  });

  test("should send help data when executed", async () => {
    let helpData: string[] = [];
    mockMessageSender
      .setup(s => s.sendSplitMessage(TypeMoq.It.isAny()))
      .returns((data: string[]) => {
        helpData = data;
        return Promise.resolve();
      });

    const result = help.execute(testExecutionData, mockMessageSender.object);

    await expect(result).resolves.toBeUndefined();
    const expectedToDisplay =
      basicCommandCount + adminCommandCount + helpHeaders;
    expect(helpData).toHaveLength(expectedToDisplay);
    mockMessageSender.verify(
      s => s.sendSplitMessage(TypeMoq.It.isAny()),
      TypeMoq.Times.once()
    );
  });

  test("should fail to send help when executed", async () => {
    const testError = new Error();
    let helpData: string[] = [];
    mockMessageSender
      .setup(s => s.sendSplitMessage(TypeMoq.It.isAny()))
      .returns((data: string[]) => {
        helpData = data;
        return Promise.reject(testError);
      });

    const result = help.execute(testExecutionData, mockMessageSender.object);

    await expect(result).rejects.toBe(testError);
    const expectedToDisplay =
      basicCommandCount + adminCommandCount + helpHeaders;
    expect(helpData).toHaveLength(expectedToDisplay);
    mockMessageSender.verify(
      s => s.sendSplitMessage(TypeMoq.It.isAny()),
      TypeMoq.Times.once()
    );
  });

  test("should not execute because the number of arguments is invalid", async () => {
    const badData: CommandExecutionData = {
      prefix: "!",
      rawMessage: testMessage,
      store: TypeMoq.Mock.ofType<Store>().object,
      client: TypeMoq.Mock.ofType<Client>().object,
      arguments: ["invalid"]
    };

    const result = help.execute(badData, mockMessageSender.object);

    await expect(result).resolves.toBeUndefined();
    mockMessageSender.verify(
      s => s.replyMessage(TypeMoq.It.isAny()),
      TypeMoq.Times.once()
    );
  });
});
