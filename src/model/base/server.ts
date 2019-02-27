import TextChannel from "@model/base/text-channel";

export default interface Server {
  readonly id: string;
  readonly textChannels: TextChannel[];
}
