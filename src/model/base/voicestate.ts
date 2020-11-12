export default interface VoiceState {
  readonly id: string;
  readonly voiceChannelId: string;

  getDisplayName(): string;
}
