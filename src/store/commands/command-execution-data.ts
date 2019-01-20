import Message from "@model/base/message";

export default interface CommandExecutionData {
  readonly trigger: string;
  readonly rawMessage: Message;
}
