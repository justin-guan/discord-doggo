import { MessageSender } from "@messenger/base/message-sender";
import Client from "@model/base/client";
import ServerStats from "@store/commands/admin/server-stats";
import CommandExecutionData from "@store/commands/command-execution-data";
import Store from "@store/store";
import * as TypeMoq from "typemoq";
import testDataGenerator from "../../../utils/test-data-generator";

describe("Server Stats Command", () => {
  const serverStats = new ServerStats();
  const serverStatsCommandName = "server-stats";
  const getAllMessagesMock = jest.fn();
  const testMessage = testDataGenerator.generateTestMessage({
    author: testDataGenerator.generateTestAuthor({
      isAdmin: () => true
    }),
    server: testDataGenerator.generateTestServer({
      textChannels: [
        testDataGenerator.generateTestTextChannel({
          getAllMessages: getAllMessagesMock
        })
      ]
    })
  });
  const testExecutionData: CommandExecutionData = {
    prefix: "!",
    rawMessage: testMessage,
    store: TypeMoq.Mock.ofType<Store>().object,
    client: TypeMoq.Mock.ofType<Client>().object,
    arguments: []
  };
  const mockMessageSender = TypeMoq.Mock.ofType<MessageSender>();
  const title = ["***__Server Emoji Stats__***"];

  afterEach(() => {
    mockMessageSender.reset();
    getAllMessagesMock.mockReset();
  });

  test("should return server stats command name as the command name", () => {
    expect(serverStats.getCommandName()).toEqual(serverStatsCommandName);
  });

  test("should count all emoji usage stats", async () => {
    getAllMessagesMock.mockImplementation(() => {
      return Promise.resolve();
    });
    mockMessageSender
      .setup(s => s.sendSplitMessage(TypeMoq.It.isAny()))
      .returns((data: string[]) => {
        assertData(data);
        return Promise.resolve();
      });

    await serverStats.execute(testExecutionData, mockMessageSender.object);
  });

  function assertData(data: string[]): void {
    expect(data[0]).toEqual(title[0]);
    mockMessageSender.verify(
      s => s.sendSplitMessage(TypeMoq.It.isAny()),
      TypeMoq.Times.once()
    );
  }
});
