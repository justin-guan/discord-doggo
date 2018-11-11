export interface Messenger {
  start(loginInfo: LoginInfo): Promise<void>;
  stop(): Promise<void>;
}

export interface LoginInfo {
  readonly messengerToken: string;
  readonly databaseUrl: string;
}
