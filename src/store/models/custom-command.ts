export interface CustomCommand {
  readonly name: string;
  readonly description: string;
  readonly type: number;
  readonly action: string;
  readonly cost: number;
}

export class CustomCommandType {
  public static VOICE = 0;
  public static TEXT = 1;
}
