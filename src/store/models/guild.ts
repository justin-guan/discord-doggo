import { CustomCommand } from "@store/models/custom-command";

export default interface Guild {
  getId(): string;
  getCommandPrefix(): string;
  setCommandPrefix(newPrefix: string): void;
  save(): Promise<Guild>;
  addNewCustomCommand(command: CustomCommand): void;
  removeCustomCommand(commandName: string): boolean;
  getCustomCommand(commandName: string): CustomCommand | undefined;
  getAllCustomCommands(): CustomCommand[];
}
