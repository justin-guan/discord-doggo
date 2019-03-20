import { MessageSender } from "@messenger/base/message-sender";
import Message from "@model/base/message";
import AbstractCommand from "@store/commands/abstract-command";
import CommandExecutionData from "@store/commands/command-execution-data";
import { CustomCommand, CustomCommandType } from "@store/models/custom-command";
import Store from "@store/store";

export default class Create extends AbstractCommand {
  public getCommandName(): string {
    return "create";
  }

  public getCommandDescription(): string {
    return "Create a custom command";
  }

  public getExpectedNumberArguments(): number {
    return 0;
  }

  protected async executeCommand(
    data: CommandExecutionData,
    messageSender: MessageSender
  ): Promise<void> {
    const server = data.rawMessage.server;
    await messageSender.sendDM(`Creating a command in server ${server.name}`);
    let step: Step = Step.NAME;
    let name: string;
    let description: string;
    let type: number;
    await messageSender.sendDM("Please enter a name for your command");
    data.rawMessage.author.collectMessages(async (message, collector) => {
      switch (step) {
        case Step.NAME:
          try {
            const nameCollection = await this.collectName(
              message,
              data.store,
              server.id
            );
            name = nameCollection[0];
            step = nameCollection[1];
            await messageSender.sendDM("What type of command is it? 1 or 2");
          } catch (e) {
            await messageSender.sendDM(
              "This command name already exists. Please enter a new one"
            );
          }
          break;
        case Step.TYPE:
          try {
            const typeCollection = await this.collectType(message);
            type = typeCollection[0];
            step = typeCollection[1];
            await messageSender.sendDM("Please enter a description");
          } catch (e) {
            await messageSender.sendDM(
              "Invalid type, please select a valid type"
            );
          }
          break;
        case Step.DESCRIPTION:
          try {
            const descriptionCollection = await this.collectDescription(
              message
            );
            description = descriptionCollection[0];
            step = descriptionCollection[1];
            await this.promptForAction(messageSender, type);
          } catch (e) {
            await messageSender.sendDM(
              "The description cannot be empty. Please enter a valid description"
            );
          }
          break;
        case Step.ACTION: // TODO: Collect the action
          const actionCollection = await this.collectAction(message);
          if (actionCollection[1] === Step.DONE) {
            collector.destroy();
            this.createCustomCommand(
              name,
              description,
              type,
              actionCollection[0]
            );
          }
          break;
        default:
          collector.destroy();
          break;
      }
    });
  }

  private async collectName(
    message: Message,
    store: Store,
    serverId: string
  ): Promise<[string, Step]> {
    if (await this.isValidCommandName(message.message, store, serverId)) {
      return [message.message, Step.TYPE];
    }
    return Promise.reject();
  }

  private async collectType(message: Message): Promise<[number, Step]> {
    const type = parseInt(message.message);
    if (type === CustomCommandType.VOICE || type === CustomCommandType.TEXT) {
      return [type, Step.DESCRIPTION];
    }
    return Promise.reject();
  }

  private async collectDescription(message: Message): Promise<[string, Step]> {
    if (this.isNotEmpty(message.message)) {
      return [message.message, Step.ACTION];
    }
    return Promise.reject();
  }

  private async collectAction(message: Message): Promise<[string, Step]> {
    return [message.message, Step.DONE];
  }

  private async isValidCommandName(
    name: string,
    store: Store,
    serverId: string
  ): Promise<boolean> {
    const isNotEmpty = this.isNotEmpty(name);
    const isNew = (await store.getCommand(serverId, name)) === undefined;
    return isNotEmpty && isNew;
  }

  private isNotEmpty(s: string): boolean {
    return s !== undefined && s.replace(/ /g, "") !== "";
  }

  private async promptForAction(
    messageSender: MessageSender,
    type: number
  ): Promise<void> {
    if (type === CustomCommandType.VOICE) {
      await messageSender.sendDM(
        "Please send me the audio you want to use\n Try dragging and dropping the audio file into Discord"
      );
    } else if (type === CustomCommandType.TEXT) {
      await messageSender.sendDM("What should this text command say?");
    }
  }

  private createCustomCommand(
    name: string,
    description: string,
    type: number,
    action: string
  ): Promise<void> {
    const customCommand: CustomCommand = {
      name,
      description,
      type,
      action,
      cost: 0
    };
    return Promise.resolve();
  }
}

enum Step {
  NAME,
  TYPE,
  DESCRIPTION,
  ACTION,
  DONE
}
