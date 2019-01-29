import Message from "@model/base/message";
import Store from "@store/store";

export default interface CommandExecutionData {
  readonly trigger: string;
  readonly rawMessage: Message;
  readonly store: Store;
  readonly arguments: string[];
}
