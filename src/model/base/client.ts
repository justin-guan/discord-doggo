export default interface Client {
  readonly id: string;

  isInVoiceChannel(channelId: string): boolean;
  playFile(voiceChannelId: string, file: string): Promise<void>;
}
