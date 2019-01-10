import Client from "@handlers/base/client";
import VoiceSynthesizer from "@handlers/base/voice-synthesizer";
import logger from "@logger";
import { MessageSender } from "@messenger/base/message-sender";
import Member from "@model/member";
import Message from "@model/message";
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
    await this.store.destroy();
  }

  public onReady(): void {
    logger.info("Client ready!");
  }

  public async onMessage(
    sender: MessageSender,
    message: Message
  ): Promise<void> {
    if (message.author.isBot) {
      return;
    }
    const prefix = await this.store.getCommandPrefix(message.serverId);
    if (!message.message.startsWith(prefix)) {
      return;
    }
    const commandName = message.message.replace(prefix, "");
    const command = await this.store.getCommand(message.serverId, commandName);
    if (command) {
      await command.execute(
        {
          trigger: prefix,
          rawMessage: message
        },
        sender
      );
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
    if (newVoiceId && this.client.isInVoiceChannel(newVoiceId)) {
      await this.sayJoin(newVoiceId, newMember.getDisplayName());
    } else if (oldVoiceId && this.client.isInVoiceChannel(oldVoiceId)) {
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
      const p = path.resolve(__dirname, `${username} ${text}.mp3`);
      await this.voiceSynthesizer.synthesize(`${username} ${text}`, p);
      await this.client.playFile(voiceChannelId, p);
    } catch (error) {
      logger.error("Failed to synthesize voice");
    }
  }
}
