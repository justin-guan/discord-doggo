import Message from "@model/base/message";

export default interface TextChannel {
  readonly name: string;

  getAllMessages(predicate: (message: Message) => void): Promise<void>;
}
