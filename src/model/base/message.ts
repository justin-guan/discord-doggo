import Author from "@model/base/author";
import { EmojiCount } from "@model/base/emoji-count";
import Server from "@model/base/server";

export default interface Message {
  readonly id: string;
  readonly message: string;
  readonly author: Author;
  readonly isDirectMessage: boolean;
  readonly emojiCount: Map<string, EmojiCount>;
  readonly server: Server;
}
