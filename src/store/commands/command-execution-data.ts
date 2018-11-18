import Message from "@model/message";

export default interface CommandExecutionData {
  readonly trigger: string;
  readonly rawMessage: Message;
}
