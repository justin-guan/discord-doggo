export default interface Messenger {
  start(token: string): Promise<void>;
  stop(): Promise<void>;
}
