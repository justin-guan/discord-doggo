import Author from "@model/base/author";
import { EmojiCounter } from "@model/base/emoji-counter";
import Server from "@model/base/server";

export default interface Message {
  readonly id: string;
  readonly message: string;
  readonly author: Author;
  readonly isDirectMessage: boolean;
  readonly emojiCount: Map<string, EmojiCounter>;
  readonly server: Server;
}
