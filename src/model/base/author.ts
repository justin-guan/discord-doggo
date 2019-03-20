import Message from "@model/base/message";
import MessageCollector from "@model/base/message-collector";

export default interface Author {
  readonly name: string;
  readonly isBot: boolean;

  joinCurrentVoiceChannel(): Promise<string>;
  leaveCurrentVoiceChannel(): Promise<void>;
  isAdmin(): boolean;
  collectMessages(
    onMessage: (msg: Message, collector: MessageCollector) => void
  ): boolean;
}
