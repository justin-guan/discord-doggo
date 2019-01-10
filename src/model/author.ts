export default interface Author {
  readonly name: string;
  readonly isBot: boolean;

  joinCurrentVoiceChannel(): Promise<void>;
  leaveCurrentVoiceChannel(): Promise<void>;
}
