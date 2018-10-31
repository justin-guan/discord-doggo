import { DiscordMessageSender } from "@messenger/discord/discord-message-sender";
import { Message, PartialTextBasedChannelFields } from "discord.js";
import * as TypeMoq from "typemoq";

describe("Discord Message Sender", () => {
  let discordMessageSender: DiscordMessageSender;
  let mockChannel: TypeMoq.IMock<PartialTextBasedChannelFields>;
  const testMessage = "test";

  beforeEach(() => {
    mockChannel = TypeMoq.Mock.ofType<PartialTextBasedChannelFields>();
    discordMessageSender = new DiscordMessageSender(mockChannel.object);
  });

  describe("Promise resolved", () => {
    const mockMessage = TypeMoq.Mock.ofType<Message>();
    beforeEach(() => {
      mockChannel
        .setup(s => s.sendMessage(TypeMoq.It.isAnyString()))
        .returns(() => Promise.resolve(mockMessage.object));
    });

    test("should send a message to a discord text channel", async () => {
      await discordMessageSender.sendMessage(testMessage);

      mockChannel.verify(
        channel => channel.send(testMessage),
        TypeMoq.Times.once()
      );
    });
  });

  describe("Promise resolved", () => {
    const mockMessage = TypeMoq.Mock.ofType<Message>();
    beforeEach(() => {
      mockChannel
        .setup(s => s.sendMessage(TypeMoq.It.isAnyString()))
        .returns(() => Promise.resolve(mockMessage.object));
    });

    test("should fail to send a message to a discord text channel", async () => {
      await discordMessageSender.sendMessage(testMessage);

      mockChannel.verify(
        channel => channel.send(testMessage),
        TypeMoq.Times.once()
      );
    });
  });
});
