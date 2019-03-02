export interface MessageSender {
  sendMessage(message: string): Promise<void>;
  sendSplitMessage(splitMessage: string[]): Promise<void>;
  replyMessage(message: string): Promise<void>;
  getFormattedCustomEmoji(emojiId: string): string;
}

export interface VoiceSender {
  sendVoiceMessage(message: string): Promise<void>;
}
