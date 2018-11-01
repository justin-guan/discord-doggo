import Author from "@model/author";

export default interface Message {
  readonly guildId: string;
  readonly message: string;
  readonly author: Author;
}
