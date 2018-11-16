export interface MessageSender {
  sendMessage(message: string): Promise<void>;
  sendSplitMessage(splitMessage: string[]): Promise<void>;
  replyMessage(message: string): Promise<void>;
}

export interface VoiceSender {
  sendVoiceMessage(message: string): Promise<void>;
}
