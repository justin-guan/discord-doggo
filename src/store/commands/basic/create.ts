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
    if (data.rawMessage.author.canCollectMessages()) {
      await messageSender.sendDM(`Creating a command in server ${server.name}`);
      await messageSender.sendDM("Please enter a name for your command");
    } else {
      await messageSender.replyMessage(
        "You're already creating a command. Check your DMs for a message from me"
      );
      return;
    }
    let step: Step = Step.NAME;
    let name: string;
    let description: string;
    let type: number;
    let action: string;
    const c = data.rawMessage.author.collectMessages(
      async (message, collector) => {
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
              await messageSender.sendDM(
                `What type of command is it?\n${
                  CustomCommandType.VOICE
                }. Voice\n${CustomCommandType.TEXT}. Text `
              );
            } catch (e) {
              await messageSender.sendDM(
                "This command name cannot be used. A command with this name must not exist, and the command name must be alphanumeric. Please try again."
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
          case Step.ACTION:
            try {
              const actionCollection = await this.collectAction(message, type);
              action = actionCollection[0];
              step = actionCollection[1];
              if (step === Step.CANCEL) {
                collector.destroy();
                await messageSender.sendDM(
                  "Cancelled custom command creation!"
                );
                return;
              }
              await this.promptCreateCommandConfirmation(
                messageSender,
                name,
                description,
                type,
                action
              );
            } catch (e) {
              await messageSender.sendDM("Invalid action, please try again");
            }
            break;
          case Step.CONFIRM:
            try {
              const confirmation = await this.collectConfirmation(message);
              if (confirmation === CONFIRMATION.YES) {
                try {
                  await this.createCustomCommand(
                    data.store,
                    server.id,
                    name,
                    description,
                    type,
                    action
                  );
                  await messageSender.sendDM("Command created!");
                } catch (e) {
                  await messageSender.sendDM(
                    "Something seems to have gone wrong while creating this command. Please try again at another time."
                  );
                }
              } else {
                await messageSender.sendDM("Command creation cancelled");
              }
              collector.destroy();
            } catch (e) {
              await messageSender.sendDM("Please enter Y or N");
            }
            break;
          default:
            collector.destroy();
            break;
        }
      }
    );
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

  private async collectAction(
    message: Message,
    type: number
  ): Promise<[string, Step]> {
    if (type === CustomCommandType.VOICE) {
      return this.collectVoiceAction(message);
    }
    return this.collectTextAction(message);
  }

  private async collectConfirmation(message: Message): Promise<CONFIRMATION> {
    const lowercase = message.message.toLowerCase();
    if (lowercase === CONFIRMATION.YES) {
      return Promise.resolve(CONFIRMATION.YES);
    } else if (lowercase === CONFIRMATION.NO) {
      return Promise.resolve(CONFIRMATION.NO);
    }
    return Promise.reject();
  }

  private collectVoiceAction(message: Message): Promise<[string, Step]> {
    if (message.message.toLowerCase() === "cancel") {
      const cancel: [string, Step] = ["", Step.CANCEL];
      return Promise.resolve(cancel);
    }
    const attachment = message.attachments[0];
    if (!attachment) {
      return Promise.reject();
    }
    const result: [string, Step] = [attachment.url, Step.CONFIRM];
    return Promise.resolve(result);
  }

  private collectTextAction(message: Message): Promise<[string, Step]> {
    if (!message.message) {
      return Promise.reject();
    }
    const result: [string, Step] = [message.message, Step.CONFIRM];
    return Promise.resolve(result);
  }

  private async isValidCommandName(
    name: string,
    store: Store,
    serverId: string
  ): Promise<boolean> {
    const isNotEmpty = this.isNotEmpty(name);
    const isAlphaNumeric = this.isAlphaNumeric(name);
    const isNew = (await store.getCommand(serverId, name)) === undefined;
    return isNotEmpty && isAlphaNumeric && isNew;
  }

  private isNotEmpty(s: string): boolean {
    return s !== undefined && s.replace(/ /g, "") !== "";
  }

  private isAlphaNumeric(s: string): boolean {
    return /^[a-z0-9]+$/i.test(s);
  }

  private async promptForAction(
    messageSender: MessageSender,
    type: number
  ): Promise<void> {
    if (type === CustomCommandType.VOICE) {
      await messageSender.sendDM(
        'Please send me the audio you want to use\nTry dragging and dropping the audio file into Discord\nYou can also type "cancel" to cancel creating this command'
      );
    } else if (type === CustomCommandType.TEXT) {
      await messageSender.sendDM("What should this text command say?");
    }
  }

  private async promptCreateCommandConfirmation(
    messageSender: MessageSender,
    name: string,
    description: string,
    type: number,
    action: string
  ): Promise<void> {
    const describeAction =
      type === CustomCommandType.VOICE
        ? `**Plays audio located at:** ${action}`
        : `**Sends the text:** ${action}`;
    messageSender.sendDM(
      `__***Custom Command Details***__` +
        `\n**name:** ${name}` +
        `\n**description:** ${description}` +
        `\n${describeAction}` +
        `\nIs this ok? <Y/N>`
    );
  }

  private createCustomCommand(
    store: Store,
    serverId: string,
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
    return store.addCustomCommand(serverId, customCommand);
  }
}

enum Step {
  NAME,
  TYPE,
  DESCRIPTION,
  ACTION,
  CONFIRM,
  DONE,
  CANCEL
}

enum CONFIRMATION {
  YES = "y",
  NO = "n"
}
