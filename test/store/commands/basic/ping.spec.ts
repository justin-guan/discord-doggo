import { MessageSender } from "@messenger/base/message-sender";
import Client from "@model/base/client";
import Message from "@model/base/message";
import Ping from "@store/commands/basic/ping";
import CommandExecutionData from "@store/commands/command-execution-data";
import Store from "@store/store";
import * as TypeMoq from "typemoq";
import testDataGenerator from "../../../utils/test-data-generator";

describe("Ping Command", () => {
  const ping = new Ping();
  const pingCommandName = "ping";
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

  test("should return ping as the command name", () => {
    expect(ping.getCommandName()).toEqual(pingCommandName);
  });

  test("should send pong when executed", async () => {
    mockMessageSender
      .setup(s => s.sendMessage(TypeMoq.It.isAnyString()))
      .returns(() => Promise.resolve());

    const result = ping.execute(testExecutionData, mockMessageSender.object);

    await expect(result).resolves.toBeUndefined();
    mockMessageSender.verify(
      s => s.sendMessage(TypeMoq.It.isAnyString()),
      TypeMoq.Times.once()
    );
  });

  test("should fail to send pong when executed", async () => {
    const testError = new Error();
    mockMessageSender
      .setup(s => s.sendMessage(TypeMoq.It.isAnyString()))
      .returns(() => Promise.reject(testError));

    const result = ping.execute(testExecutionData, mockMessageSender.object);

    await expect(result).rejects.toBe(testError);
    mockMessageSender.verify(
      s => s.sendMessage(TypeMoq.It.isAnyString()),
      TypeMoq.Times.once()
    );
  });
});
