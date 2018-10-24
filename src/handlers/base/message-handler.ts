import { MessageSender } from "@messenger/base/message-sender";

export interface MessageHandler {
  handleMessage(sender: MessageSender, message: Message): Promise<void>;
}

export interface Message {
  readonly message: string;
  readonly author: Author;
}

export interface Author {
  readonly name: string;
  readonly isBot: boolean;
}
