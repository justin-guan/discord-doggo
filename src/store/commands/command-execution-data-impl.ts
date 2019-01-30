import Message from "@model/base/message";
import CommandExecutionData from "@store/commands/command-execution-data";
import Store from "@store/store";

export default class CommandExecutionDataImpl implements CommandExecutionData {
  public readonly prefix: string;
  public readonly rawMessage: Message;
  public readonly store: Store;
  public readonly arguments: string[];

  public readonly commandName: string;

  constructor(prefix: string, message: Message, store: Store) {
    this.prefix = prefix;
    this.rawMessage = message;
    this.store = store;
    const split = message.message.split(" ");
    this.commandName = split[0].replace(prefix, "");
    this.arguments = split.slice(1);
  }
}
