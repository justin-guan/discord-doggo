import Author from "@model/author";

export default interface Message {
  readonly message: string;
  readonly author: Author;
}
