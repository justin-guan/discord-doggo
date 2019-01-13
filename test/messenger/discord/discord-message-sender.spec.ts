import { DiscordMessageSender } from "@messenger/discord/discord-message-sender";
import { DMChannel, GroupDMChannel, Message, TextChannel } from "discord.js";
import * as TypeMoq from "typemoq";

describe("Discord Message Sender", () => {
  let discordMessageSender: DiscordMessageSender;
  let mockMessage: TypeMoq.IMock<Message>;
  let mockChannel: TypeMoq.IMock<TextChannel | DMChannel | GroupDMChannel>;
  const testMessage = "test";

  beforeEach(() => {
    mockMessage = TypeMoq.Mock.ofType<Message>();
    mockChannel = TypeMoq.Mock.ofType<
      TextChannel | DMChannel | GroupDMChannel
    >();
    mockMessage.setup(m => m.channel).returns(() => {
      return mockChannel.object;
    });
    discordMessageSender = new DiscordMessageSender(mockMessage.object);
  });

  test("should try to send a message", async () => {
    await discordMessageSender.sendMessage(testMessage);

    mockChannel.verify(c => c.send(testMessage), TypeMoq.Times.once());
  });

  test("should try to send a split message", async () => {
    await discordMessageSender.sendSplitMessage([testMessage]);

    mockChannel.verify(
      c => c.send([testMessage], { split: true }),
      TypeMoq.Times.once()
    );
  });

  test("should try to reply to a message", async () => {
    await discordMessageSender.replyMessage(testMessage);

    mockMessage.verify(m => m.reply(testMessage), TypeMoq.Times.once());
  });
});
