import { MessageSender } from "@messenger/base/message-sender";
import Client from "@model/base/client";
import Message from "@model/base/message";
import Prefix from "@store/commands/admin/prefix";
import CommandExecutionData from "@store/commands/command-execution-data";
import Store from "@store/store";
import * as TypeMoq from "typemoq";
import testDataGenerator from "../../../utils/test-data-generator";

describe("Prefix Command", () => {
  const prefix = new Prefix();
  const prefixCommandName = "prefix";
  const testMessage: Message = testDataGenerator.generateTestMessage({
    author: testDataGenerator.generateTestAuthor({
      isAdmin: () => true
    })
  });
  const mockStore = TypeMoq.Mock.ofType<Store>();
  const testExecutionData: CommandExecutionData = {
    prefix: "!",
    rawMessage: testMessage,
    store: mockStore.object,
    client: TypeMoq.Mock.ofType<Client>().object,
    arguments: ["?"]
  };
  const mockMessageSender = TypeMoq.Mock.ofType<MessageSender>();

  beforeEach(() => {
    mockMessageSender
      .setup(s => s.replyMessage(TypeMoq.It.isAny()))
      .returns(() => Promise.resolve());
  });

  afterEach(() => {
    mockStore.reset();
    mockMessageSender.reset();
  });

  test("should return prefix as the command name", () => {
    expect(prefix.getCommandName()).toEqual(prefixCommandName);
  });

  test("should update the command prefix", async () => {
    mockStore
      .setup(s => s.updateCommandPrefix(TypeMoq.It.isAny()))
      .returns(() => Promise.resolve());

    const result = prefix.execute(testExecutionData, mockMessageSender.object);

    await expect(result).resolves.toBeUndefined();
    mockStore.verify(
      s =>
        s.updateCommandPrefix({
          serverId: testExecutionData.rawMessage.server.id,
          newPrefix: testExecutionData.arguments[0]
        }),
      TypeMoq.Times.once()
    );
  });

  test("should fail to update the command prefix", async () => {
    mockStore
      .setup(s => s.updateCommandPrefix(TypeMoq.It.isAny()))
      .returns(() => Promise.reject());

    const result = prefix.execute(testExecutionData, mockMessageSender.object);

    await expect(result).resolves.toBeUndefined();
    mockStore.verify(
      s =>
        s.updateCommandPrefix({
          serverId: testExecutionData.rawMessage.server.id,
          newPrefix: testExecutionData.arguments[0]
        }),
      TypeMoq.Times.once()
    );
    mockMessageSender.verify(
      s => s.replyMessage("Failed to update prefix"),
      TypeMoq.Times.once()
    );
  });
});
