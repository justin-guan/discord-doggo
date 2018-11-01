import logger from "@logger";
import { MessageSender } from "@messenger/base/message-sender";
import Message from "@model/message";
import Store from "@store/store";

export default class EventHandler {
  private store = new Store();

  public async initialize(storeUri: string): Promise<void> {
    await this.store.initialize(storeUri);
  }

  public async destroy(): Promise<void> {
    await this.store.destroy();
  }

  public onReady(): void {
    logger.info("Client ready!");
  }

  public async onMessage(
    sender: MessageSender,
    message: Message
  ): Promise<void> {
    if (message.author.isBot) {
      return;
    }
    const prefix = await this.store.getCommandPrefix(message.serverId);
    if (!message.message.startsWith(prefix)) {
      return;
    }
    const commandName = message.message.replace(prefix, "").toLowerCase();
    const command = await this.store.getCommand(message.serverId, commandName);
    if (command) {
      await command.execute(message, sender);
    }
  }
}
