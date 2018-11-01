import { MessageSender } from "@messenger/base/message-sender";
import Message from "@model/message";
import Command from "@store/commands/command";

export default class Ping implements Command {
  public getCommandName(): string {
    return "Ping";
  }

  public getCommandDescription(): string {
    return "Pong!";
  }

  public async execute(
    message: Message,
    messageSender: MessageSender
  ): Promise<void> {
    await messageSender.sendMessage("pong!");
  }
}
