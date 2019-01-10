import Author from "@model/base/author";

export default interface Message {
  readonly serverId: string;
  readonly message: string;
  readonly author: Author;
}
