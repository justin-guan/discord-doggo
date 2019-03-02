export class EmojiCounter {
  public readonly identifier: string;
  public readonly type: EmojiType;
  private occurrences = 0;

  constructor(identifer: string, emojiType: EmojiType) {
    this.identifier = identifer;
    this.type = emojiType;
  }

  public get count(): number {
    return this.occurrences;
  }

  public add(amount: number): void {
    this.occurrences += amount;
  }
}

export enum EmojiType {
  UNICODE,
  CUSTOM
}
