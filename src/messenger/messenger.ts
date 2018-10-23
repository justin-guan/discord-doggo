export default interface Messenger {
  login(token: string): Promise<void>;
  start(): void;
}
