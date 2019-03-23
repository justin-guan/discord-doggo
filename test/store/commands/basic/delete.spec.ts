import { MessageSender } from "@messenger/base/message-sender";
import Client from "@model/base/client";
import Message from "@model/base/message";
import Delete from "@store/commands/basic/delete";
import Ping from "@store/commands/basic/ping";
import CommandExecutionData from "@store/commands/command-execution-data";
import Store from "@store/store";
import * as TypeMoq from "typemoq";
import testDataGenerator from "../../../utils/test-data-generator";

describe("Delete Command", () => {
  const deleteCommand = new Delete();
  const deleteCommandName = "delete";
  const testMessage: Message = testDataGenerator.generateTestMessage();
  const mockStore = TypeMoq.Mock.ofType<Store>();
  const testCommandName = "test";
  const testExecutionData: CommandExecutionData = {
    prefix: "!",
    rawMessage: testMessage,
    store: mockStore.object,
    client: TypeMoq.Mock.ofType<Client>().object,
    arguments: [testCommandName]
  };
  const mockMessageSender = TypeMoq.Mock.ofType<MessageSender>();

  afterEach(() => {
    mockStore.reset();
    mockMessageSender.reset();
  });

  test("should return ping as the command name", () => {
    expect(deleteCommand.getCommandName()).toEqual(deleteCommandName);
  });

  test("should delete a custom command", async () => {
    mockStore
      .setup(s => s.removeCustomCommand(TypeMoq.It.isAny(), TypeMoq.It.isAny()))
      .returns(() => Promise.resolve(true));

    await deleteCommand.execute(testExecutionData, mockMessageSender.object);

    mockMessageSender.verify(
      s => s.replyMessage(`Deleted custom command ${testCommandName}`),
      TypeMoq.Times.once()
    );
  });

  test("should not delete a custom command", async () => {
    mockStore
      .setup(s => s.removeCustomCommand(TypeMoq.It.isAny(), TypeMoq.It.isAny()))
      .returns(() => Promise.resolve(false));

    await deleteCommand.execute(testExecutionData, mockMessageSender.object);

    mockMessageSender.verify(
      s => s.replyMessage(`${testCommandName} could not be removed`),
      TypeMoq.Times.once()
    );
  });
});
