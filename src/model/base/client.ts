export default interface Client {
  readonly id: string;

  isInVoiceChannel(channelId: string): boolean;
  getConnectedVoiceChannelIds(): string[];
  joinVoiceChannel(voiceChannelId: string): Promise<void>;
  playFile(voiceChannelId: string, file: string): Promise<void>;
}
