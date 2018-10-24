import { VoiceSender } from "@messenger/message-sender";

export interface VoiceStateHandler {
  handleVoiceStateUpdate(
    voiceSender: VoiceSender,
    oldVoiceState: VoiceState,
    newVoiceState: VoiceState
  ): Promise<void>;
}

export interface VoiceState {
  readonly id: string;
  readonly voiceChannelId: string;
}
