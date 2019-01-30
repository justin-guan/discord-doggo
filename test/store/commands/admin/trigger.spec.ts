import { MessageSender } from "@messenger/base/message-sender";
import Message from "@model/base/message";
import Trigger from "@store/commands/admin/trigger";
import CommandExecutionData from "@store/commands/command-execution-data";
import Store from "@store/store";
import * as TypeMoq from "typemoq";

describe("Trigger Command", () => {
  const trigger = new Trigger();
  const triggerCommandName = "trigger";
  const testMessage: Message = {
    serverId: "",
    message: "",
    author: {
      isBot: false,
      name: "",
      joinCurrentVoiceChannel: jest.fn(),
      leaveCurrentVoiceChannel: jest.fn(),
      isAdmin: () => true
    }
  };
  const mockStore = TypeMoq.Mock.ofType<Store>();
  const testExecutionData: CommandExecutionData = {
    trigger: "!",
    rawMessage: testMessage,
    store: mockStore.object,
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

  test("should return trigger as the command name", () => {
    expect(trigger.getCommandName()).toEqual(triggerCommandName);
  });

  test("should update the command prefix", async () => {
    mockStore
      .setup(s => s.updateCommandPrefix(TypeMoq.It.isAny()))
      .returns(() => Promise.resolve());

    const result = trigger.execute(testExecutionData, mockMessageSender.object);

    await expect(result).resolves.toBeUndefined();
    mockStore.verify(
      s =>
        s.updateCommandPrefix({
          serverId: testExecutionData.rawMessage.serverId,
          newPrefix: testExecutionData.arguments[0]
        }),
      TypeMoq.Times.once()
    );
  });

  test("should fail to update the command prefix", async () => {
    mockStore
      .setup(s => s.updateCommandPrefix(TypeMoq.It.isAny()))
      .returns(() => Promise.reject());

    const result = trigger.execute(testExecutionData, mockMessageSender.object);

    await expect(result).resolves.toBeUndefined();
    mockStore.verify(
      s =>
        s.updateCommandPrefix({
          serverId: testExecutionData.rawMessage.serverId,
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
