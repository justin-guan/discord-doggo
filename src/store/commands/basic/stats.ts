import { MessageSender } from "@messenger/base/message-sender";
import { EmojiCount, EmojiType } from "@model/base/emoji-count";
import AbstractCommand from "@store/commands/abstract-command";
import Command from "@store/commands/command";
import CommandExecutionData from "@store/commands/command-execution-data";

export default class Stats extends AbstractCommand implements Command {
  public getCommandName(): string {
    return "stats";
  }

  public getCommandDescription(): string {
    return "Get stats about the emoji usage in this server. This may take some time to run";
  }

  public getExpectedNumberArguments(): number {
    return 0;
  }

  protected async executeCommand(
    data: CommandExecutionData,
    messageSender: MessageSender
  ): Promise<void> {
    const map = new Map<string, EmojiCount>();
    await Promise.all(
      data.rawMessage.server.textChannels.map(async textChannel => {
        await textChannel.getAllMessages(message => {
          message.emojiCount.forEach((value, key) => {
            const count = map.get(value.identifier);
            if (count !== undefined) {
              count.add(value.count);
            } else {
              map.set(key, value);
            }
          });
        });
      })
    );
    const title = ["***__Server Emoji Stats__***"];
    const emojiCountInfo = Array.from(map.values()).map(emojiCount => {
      if (emojiCount.type === EmojiType.CUSTOM) {
        return `${messageSender.getFormattedCustomEmoji(
          emojiCount.identifier
        )}: ${emojiCount.count}`;
      }
      return `${emojiCount.identifier}: ${emojiCount.count}`;
    });
    await messageSender.sendSplitMessage(title.concat(emojiCountInfo));
  }
}
