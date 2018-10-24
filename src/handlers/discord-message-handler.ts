import { Message, MessageHandler } from "@handlers/message-handler";
import { MessageSender } from "@messenger/message-sender";

export class DiscordMessageHandler implements MessageHandler {
  public async handleMessage(
    sender: MessageSender,
    input: Message
  ): Promise<void> {
    // TODO: Currently just pingpongs the message back, make this actually do something interesting
    if (!input.author.isBot) {
      await sender.sendMessage(input.message);
    }
  }
}
