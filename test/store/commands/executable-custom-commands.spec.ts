jest.mock("@logger");
import { MessageSender } from "@messenger/base/message-sender";
import Client from "@model/base/client";
import Message from "@model/base/message";
import CommandExecutionData from "@store/commands/command-execution-data";
import ExecutableCustomCommand from "@store/commands/executable-custom-command";
import { CustomCommandType } from "@store/models/custom-command";
import Store from "@store/store";
import * as TypeMoq from "typemoq";
import testDataGenerator from "../../utils/test-data-generator";

describe("Executable Custom Commands", () => {
  test("should return the custom command name", () => {
    const testCommandName = "test command name";
    const testCustomCommand = testDataGenerator.generateCustomCommand({
      name: testCommandName
    });
    const command = new ExecutableCustomCommand(testCustomCommand);

    expect(command.getCommandName()).toEqual(testCommandName);
  });

  test("should return the custom command description", () => {
    const testCommandDescription = "test command name";
    const testCustomCommand = testDataGenerator.generateCustomCommand({
      description: testCommandDescription
    });
    const command = new ExecutableCustomCommand(testCustomCommand);

    expect(command.getCommandDescription()).toEqual(testCommandDescription);
  });

  test("should have no arguments", () => {
    const testCustomCommand = testDataGenerator.generateCustomCommand();
    const command = new ExecutableCustomCommand(testCustomCommand);

    expect(command.getExpectedNumberArguments()).toEqual(0);
  });

  test("should play a voice command", async () => {
    const testVoiceChannelId = "";
    const data = createTestData(() => Promise.resolve(testVoiceChannelId));
    const testExecutionData = data[0];
    const mockClient = data[1];
    const mockMessageSender = TypeMoq.Mock.ofType<MessageSender>();
    const testCustomCommand = testDataGenerator.generateCustomCommand({
      type: CustomCommandType.VOICE
    });
    const command = new ExecutableCustomCommand(testCustomCommand);

    await command.execute(testExecutionData, mockMessageSender.object);

    mockClient.verify(
      c => c.play(testVoiceChannelId, testCustomCommand.action),
      TypeMoq.Times.once()
    );
  });

  test("should fail to play a voice command", async () => {
    const data = createTestData(() => Promise.reject());
    const testExecutionData = data[0];
    const mockClient = data[1];
    const mockMessageSender = TypeMoq.Mock.ofType<MessageSender>();
    const testCustomCommand = testDataGenerator.generateCustomCommand({
      type: CustomCommandType.VOICE
    });
    const command = new ExecutableCustomCommand(testCustomCommand);

    await command.execute(testExecutionData, mockMessageSender.object);

    mockClient.verify(
      c => c.play(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString()),
      TypeMoq.Times.never()
    );
    mockMessageSender.verify(
      s => s.replyMessage(TypeMoq.It.isAnyString()),
      TypeMoq.Times.once()
    );
  });

  test("should execute a text command", async () => {
    const data = createTestData(() => Promise.reject());
    const testExecutionData = data[0];
    const mockMessageSender = TypeMoq.Mock.ofType<MessageSender>();
    const testCustomCommand = testDataGenerator.generateCustomCommand({
      type: CustomCommandType.TEXT
    });
    const command = new ExecutableCustomCommand(testCustomCommand);

    await command.execute(testExecutionData, mockMessageSender.object);

    mockMessageSender.verify(
      s => s.sendMessage(testCustomCommand.action),
      TypeMoq.Times.once()
    );
  });

  test("should do nothing on malformed command", async () => {
    const data = createTestData(() => Promise.reject());
    const testExecutionData = data[0];
    const mockClient = data[1];
    const mockMessageSender = TypeMoq.Mock.ofType<MessageSender>();
    const testCustomCommand = testDataGenerator.generateCustomCommand({
      type: -1
    });
    const command = new ExecutableCustomCommand(testCustomCommand);

    await command.execute(testExecutionData, mockMessageSender.object);

    mockClient.verify(
      c => c.play(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString()),
      TypeMoq.Times.never()
    );
    mockMessageSender.verify(
      s => s.replyMessage(TypeMoq.It.isAnyString()),
      TypeMoq.Times.never()
    );
    mockMessageSender.verify(
      s => s.sendMessage(TypeMoq.It.isAnyString()),
      TypeMoq.Times.never()
    );
  });

  function createTestData(
    join: () => Promise<string>
  ): [CommandExecutionData, TypeMoq.IMock<Client>] {
    const testMessage: Message = testDataGenerator.generateTestMessage({
      author: testDataGenerator.generateTestAuthor({
        joinCurrentVoiceChannel: join
      })
    });
    const mockClient = TypeMoq.Mock.ofType<Client>();
    mockClient
      .setup(c => c.play(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString()))
      .returns(() => Promise.resolve());
    const testExecutionData: CommandExecutionData = {
      prefix: "!",
      rawMessage: testMessage,
      store: TypeMoq.Mock.ofType<Store>().object,
      client: mockClient.object,
      arguments: []
    };
    return [testExecutionData, mockClient];
  }
});
