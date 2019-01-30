import { MessageSender } from "@messenger/base/message-sender";
import Message from "@model/base/message";
import Banish from "@store/commands/basic/banish";
import CommandExecutionData from "@store/commands/command-execution-data";
import Store from "@store/store";
import * as TypeMoq from "typemoq";

describe("Banish Command", () => {
  const banish = new Banish();
  const banishCommandName = "banish";

  const mockBanish = jest.fn();
  const testMessage: Message = {
    serverId: "",
    message: "",
    author: {
      isBot: false,
      name: "",
      joinCurrentVoiceChannel: jest.fn(),
      leaveCurrentVoiceChannel: mockBanish,
      isAdmin: () => false
    }
  };
  const testExecutionData: CommandExecutionData = {
    prefix: "!",
    rawMessage: testMessage,
    store: TypeMoq.Mock.ofType<Store>().object,
    arguments: []
  };
  const mockMessageSender = TypeMoq.Mock.ofType<MessageSender>();

  beforeEach(() => {
    mockMessageSender
      .setup(s => s.replyMessage(TypeMoq.It.isAnyString()))
      .returns(() => Promise.resolve());
  });

  afterEach(() => {
    mockMessageSender.reset();
    mockBanish.mockReset();
  });

  test("should return banish as the command name", () => {
    expect(banish.getCommandName()).toEqual(banishCommandName);
  });

  test("should banish from the author voice channel", async () => {
    const result = banish.execute(testExecutionData, mockMessageSender.object);

    await expect(result).resolves.toBeUndefined();
    expect(mockBanish).toBeCalledTimes(1);
    mockMessageSender.verify(
      s => s.replyMessage(TypeMoq.It.isAnyString()),
      TypeMoq.Times.never()
    );
  });

  test("should fail to banish from the author voice channel", async () => {
    mockBanish.mockImplementation(() => Promise.reject());

    const result = banish.execute(testExecutionData, mockMessageSender.object);

    await expect(result).resolves.toBeUndefined();
    expect(mockBanish).toBeCalledTimes(1);
    mockMessageSender.verify(
      s => s.replyMessage(TypeMoq.It.isAnyString()),
      TypeMoq.Times.once()
    );
  });

  test("should fail to banish from the author voice channel and notify", async () => {
    mockBanish.mockImplementation(() => Promise.reject());
    mockMessageSender
      .setup(s => s.replyMessage(TypeMoq.It.isAnyString()))
      .returns(() => Promise.reject());

    const result = banish.execute(testExecutionData, mockMessageSender.object);

    await expect(result).resolves.toBeUndefined();
    expect(mockBanish).toBeCalledTimes(1);
    mockMessageSender.verify(
      s => s.replyMessage(TypeMoq.It.isAnyString()),
      TypeMoq.Times.once()
    );
  });
});
