import TextChannel from "@model/base/text-channel";

export default interface Server {
  readonly id: string;
  readonly name: string;
  readonly textChannels: TextChannel[];
}
