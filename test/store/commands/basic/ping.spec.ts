import { MessageSender } from "@messenger/base/message-sender";
import Message from "@model/message";
import Ping from "@store/commands/basic/ping";
import * as TypeMoq from "typemoq";

describe("Ping Command", () => {
  const ping = new Ping();
  const pingCommandName = "ping";
  const empty = "";
  const testMessage: Message = {
    serverId: "",
    message: "",
    author: {
      isBot: false,
      name: ""
    }
  };
  const mockMessageSender = TypeMoq.Mock.ofType<MessageSender>();

  afterEach(() => {
    mockMessageSender.reset();
  });

  test("should return ping as the command name", () => {
    expect(ping.getCommandName()).toEqual(pingCommandName);
  });

  test("should return the ping command description", () => {
    expect(ping.getCommandDescription()).not.toEqual(empty);
  });

  test("should send pong when executed", async () => {
    mockMessageSender
      .setup(s => s.sendMessage(TypeMoq.It.isAnyString()))
      .returns(() => Promise.resolve());

    const result = ping.execute(testMessage, mockMessageSender.object);

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

    const result = ping.execute(testMessage, mockMessageSender.object);

    await expect(result).rejects.toBe(testError);
    mockMessageSender.verify(
      s => s.sendMessage(TypeMoq.It.isAnyString()),
      TypeMoq.Times.once()
    );
  });
});
