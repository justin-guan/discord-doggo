export default interface ClientVoiceConnectionsConfig {
  getLastJoinedVoiceChannelIds(): string[];
  saveConnectedVoiceChannelIds(voiceChannelIds: string[]): Promise<void>;
}
