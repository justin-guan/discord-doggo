export default interface Guild {
  getId(): string;
  getCommandPrefix(): string;
  setCommandPrefix(newPrefix: string): void;
  save(): Promise<Guild>;
}
