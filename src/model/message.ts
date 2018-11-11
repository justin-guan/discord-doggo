import Author from "@model/author";

export default interface Message {
  readonly serverId: string;
  readonly message: string;
  readonly author: Author;
}
