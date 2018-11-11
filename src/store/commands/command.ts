import { MessageSender } from "@messenger/base/message-sender";
import Message from "@model/message";

export default interface Command {
  getCommandName(): string;
  getCommandDescription(): string;
  execute(message: Message, messageSender: MessageSender): Promise<void>;
}
