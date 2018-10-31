export default interface Guild {
  setCommandPrefix(newPrefix: string): void;
  save(): Promise<Guild>;
}
