export default interface Member {
  readonly id: string;
  readonly voiceChannelId: string;

  getDisplayName(): string;
}
