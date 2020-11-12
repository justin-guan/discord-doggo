export default interface Member {
  readonly id: string;
  readonly voiceChannelId: string;

  // prettier-ignore
  getDisplayName(): string;
}
