import Message from "@model/base/message";
import CommandExecutionData from "@store/commands/command-execution-data";
import Store from "@store/store";

export default class CommandExecutionDataImpl implements CommandExecutionData {
  public readonly trigger: string;
  public readonly rawMessage: Message;
  public readonly store: Store;
  public readonly arguments: string[];

  public readonly commandName: string;

  constructor(trigger: string, message: Message, store: Store) {
    this.trigger = trigger;
    this.rawMessage = message;
    this.store = store;
    const split = message.message.split(" ");
    this.commandName = split[0].replace(trigger, "");
    this.arguments = split.slice(1);
  }
}
