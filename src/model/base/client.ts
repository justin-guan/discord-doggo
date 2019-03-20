export default interface Client {
  readonly id: string;

  isInVoiceChannel(channelId: string): boolean;
  getConnectedVoiceChannelIds(): string[];
  joinVoiceChannel(voiceChannelId: string): Promise<void>;
  play(voiceChannelId: string, url: string): Promise<void>;
}
