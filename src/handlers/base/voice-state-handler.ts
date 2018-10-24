import { VoiceSender } from "@messenger/base/message-sender";

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
