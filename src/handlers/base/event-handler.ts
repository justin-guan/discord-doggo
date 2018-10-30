import logger from "@logger";
import { MessageSender } from "@messenger/base/message-sender";
import Message from "@model/message";

export default class EventHandler {
  public onReady(): void {
    logger.info("Client ready!");
  }

  public async onMessage(
    sender: MessageSender,
    message: Message
  ): Promise<void> {
    if (!message.author.isBot) {
      await sender.sendMessage(message.message);
    }
  }
}
