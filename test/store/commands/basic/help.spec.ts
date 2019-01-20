import { MessageSender } from "@messenger/base/message-sender";
import Message from "@model/base/message";
import Help from "@store/commands/basic/help";
import Command from "@store/commands/command";
import CommandExecutionData from "@store/commands/command-execution-data";
import * as TypeMoq from "typemoq";

jest.mock("@store/commands/basic", () => {
  return {
    Commands: new Set<Command>([
      {
        getCommandName: () => "2",
        getCommandDescription: jest.fn(),
        execute: jest.fn()
      },
      {
        getCommandName: () => "1",
        getCommandDescription: jest.fn(),
        execute: jest.fn()
      }
    ])
  };
});
const basicCommandCount = 2;

describe("Help Command", () => {
  const help = new Help();
  const helpCommandName = "help";
  const empty = "";
  const testMessage: Message = {
    serverId: "",
    message: "",
    author: {
      isBot: false,
      name: "",
      joinCurrentVoiceChannel: jest.fn(),
      leaveCurrentVoiceChannel: jest.fn()
    }
  };
  const testExecutionData: CommandExecutionData = {
    trigger: "!",
    rawMessage: testMessage
  };
  const mockMessageSender = TypeMoq.Mock.ofType<MessageSender>();

  afterEach(() => {
    mockMessageSender.reset();
  });

  test("should return help as the command name", () => {
    expect(help.getCommandName()).toEqual(helpCommandName);
  });

  test("should return the help command description", () => {
    expect(help.getCommandDescription()).not.toEqual(empty);
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
    expect(helpData).toHaveLength(basicCommandCount + 1);
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
    expect(helpData).toHaveLength(basicCommandCount + 1);
    mockMessageSender.verify(
      s => s.sendSplitMessage(TypeMoq.It.isAny()),
      TypeMoq.Times.once()
    );
  });
});
