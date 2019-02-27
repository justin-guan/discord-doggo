export default class DiscordCustomEmoji {
  private emoji: string;
  private emojiId: string;

  constructor(emoji: string) {
    this.emoji = emoji;
    this.emojiId = this.parseId();
  }

  public get id(): string {
    return this.emojiId;
  }

  private parseId(): string {
    const matches = this.emoji.match(/\:[0-9]+/) || [];
    if (matches.length !== 1) {
      throw new Error(
        `Found ${matches.length} matches for emoji id, when only 1 was expected`
      );
    }
    return matches[0].substring(1);
  }
}
