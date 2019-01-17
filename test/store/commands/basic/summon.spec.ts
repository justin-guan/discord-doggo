import { MessageSender } from "@messenger/base/message-sender";
import Message from "@model/base/message";
import Summon from "@store/commands/basic/summon";
import CommandExecutionData from "@store/commands/command-execution-data";
import * as TypeMoq from "typemoq";

describe("Summon Command", () => {
  const summon = new Summon();
  const summonCommandName = "summon";
  const empty = "";

  const mockJoin = jest.fn();
  const testMessage: Message = {
    serverId: "",
    message: "",
    author: {
      isBot: false,
      name: "",
      joinCurrentVoiceChannel: mockJoin,
      leaveCurrentVoiceChannel: jest.fn()
    }
  };
  const testExecutionData: CommandExecutionData = {
    trigger: "!",
    rawMessage: testMessage
  };
  const mockMessageSender = TypeMoq.Mock.ofType<MessageSender>();

  beforeEach(() => {
    mockMessageSender
      .setup(s => s.replyMessage(TypeMoq.It.isAnyString()))
      .returns(() => Promise.resolve());
  });

  afterEach(() => {
    mockMessageSender.reset();
    mockJoin.mockReset();
  });

  test("should return summon as the command name", () => {
    expect(summon.getCommandName()).toEqual(summonCommandName);
  });

  test("should return the summon command description", () => {
    expect(summon.getCommandDescription()).not.toEqual(empty);
  });

  test("should join the author voice channel", async () => {
    const result = summon.execute(testExecutionData, mockMessageSender.object);

    await expect(result).resolves.toBeUndefined();
    expect(mockJoin).toBeCalledTimes(1);
    mockMessageSender.verify(
      s => s.replyMessage(TypeMoq.It.isAnyString()),
      TypeMoq.Times.never()
    );
  });

  test("should fail to join the author voice channel", async () => {
    mockJoin.mockImplementation(() => Promise.reject());

    const result = summon.execute(testExecutionData, mockMessageSender.object);

    await expect(result).resolves.toBeUndefined();
    expect(mockJoin).toBeCalledTimes(1);
    mockMessageSender.verify(
      s => s.replyMessage(TypeMoq.It.isAnyString()),
      TypeMoq.Times.once()
    );
  });

  test("should fail to join the author voice channel and notify", async () => {
    mockJoin.mockImplementation(() => Promise.reject());
    mockMessageSender
      .setup(s => s.replyMessage(TypeMoq.It.isAnyString()))
      .returns(() => Promise.reject());

    const result = summon.execute(testExecutionData, mockMessageSender.object);

    await expect(result).resolves.toBeUndefined();
    expect(mockJoin).toBeCalledTimes(1);
    mockMessageSender.verify(
      s => s.replyMessage(TypeMoq.It.isAnyString()),
      TypeMoq.Times.once()
    );
  });
});
