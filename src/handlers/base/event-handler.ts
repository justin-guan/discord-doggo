import VoiceSynthesizer from "@handlers/base/voice-synthesizer";
import logger from "@logger";
import { MessageSender } from "@messenger/base/message-sender";
import Client from "@model/base/client";
import { EmojiCounter } from "@model/base/emoji-counter";
import Member from "@model/base/member";
import Message from "@model/base/message";
import CommandExecutionDataImpl from "@store/commands/command-execution-data-impl";
import Store from "@store/store";
import path from "path";

export default class EventHandler {
  private store = new Store();
  private voiceSynthesizer = new VoiceSynthesizer();
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  public async initialize(storeUri: string): Promise<void> {
    await this.store.initialize(storeUri);
  }

  public async destroy(): Promise<void> {
    await this.saveConnections();
    await this.store.destroy();
  }

  public async onReady(): Promise<void> {
    await this.rejoinPreviousConnections();
    logger.info("Client ready!");
  }

  public async onMessage(
    sender: MessageSender,
    message: Message
  ): Promise<void> {
    if (message.author.isBot || message.isDirectMessage) {
      return;
    }
    const prefix = await this.store.getCommandPrefix(message.server.id);
    if (!message.message.startsWith(prefix)) {
      return;
    }
    const data = new CommandExecutionDataImpl(prefix, message, this.store);
    const commandName = data.commandName;
    const command = await this.store.getCommand(message.server.id, commandName);
    if (command) {
      await command.execute(data, sender);
    }
  }

  public async onVoiceStateUpdate(
    oldMember: Member,
    newMember: Member
  ): Promise<void> {
    const oldVoiceId = oldMember.voiceChannelId;
    const newVoiceId = newMember.voiceChannelId;
    if (newMember.id === this.client.id || oldVoiceId === newVoiceId) {
      return;
    }
    if (this.client.isInVoiceChannel(newVoiceId)) {
      await this.sayJoin(newVoiceId, newMember.getDisplayName());
    } else if (this.client.isInVoiceChannel(oldVoiceId)) {
      await this.sayLeave(oldVoiceId, newMember.getDisplayName());
    }
  }

  private async sayJoin(
    voiceChannelId: string,
    username: string
  ): Promise<void> {
    await this.say(voiceChannelId, username, "joined the channel");
  }

  private async sayLeave(
    voiceChannelId: string,
    username: string
  ): Promise<void> {
    await this.say(voiceChannelId, username, "left the channel");
  }

  private async say(
    voiceChannelId: string,
    username: string,
    text: string
  ): Promise<void> {
    try {
      const absPath = path.resolve(__dirname, `${username} ${text}.mp3`);
      const synthPath = await this.voiceSynthesizer.synthesize(
        `${username} ${text}`,
        absPath
      );
      await this.client.playFile(voiceChannelId, synthPath);
    } catch (error) {
      logger.error("Failed to synthesize voice");
    }
  }

  private async saveConnections(): Promise<void> {
    await this.store.saveConnections(this.client.getConnectedVoiceChannelIds());
  }

  private async rejoinPreviousConnections(): Promise<void> {
    const oldConnections = await this.store.getPreviousConnections();
    const joinPromises = oldConnections.map(voiceChannelId =>
      this.client.joinVoiceChannel(voiceChannelId)
    );
    await Promise.all(joinPromises);
  }

  private async updateEmojiStats(message: Message): Promise<void> {
    // message.emojiCount.forEach((id, count) => {
    // });
  }
}
