import VoiceSynthesizer from "@handlers/base/voice-synthesizer";
import logger from "@logger";
import { MessageSender } from "@messenger/base/message-sender";
import Client from "@model/base/client";
import Member from "@model/base/member";
import Message from "@model/base/message";
import CommandExecutionDataImpl from "@store/commands/command-execution-data-impl";
import { CustomCommandType } from "@store/models/custom-command";
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
      const authorName = message.author.name;
      logger.info(`${authorName} invoked command ${command.getCommandName()}`);
      await message.delete();
      await command.execute(data, sender);
    }
  }

  public async onVoiceStateUpdate(
    oldMember: Member,
    newMember: Member
  ): Promise<void> {
    const oldVoiceId = oldMember.voiceChannelId;
    const newVoiceId = newMember.voiceChannelId;
    const save = this.checkIfBotVoiceStateUpdate(newMember.id);
    if (newMember.id === this.client.id || oldVoiceId === newVoiceId) {
      await save;
      return;
    }
    const promises = [save];
    const name = newMember.getDisplayName();
    if (this.client.isInVoiceChannel(newVoiceId)) {
      logger.info(`${name} (${newMember.id}) joined channel ${newVoiceId}`);
      const say = this.sayJoin(newVoiceId, newMember.getDisplayName());
      promises.push(say);
    } else if (this.client.isInVoiceChannel(oldVoiceId)) {
      logger.info(`${name} (${newMember.id}) left channel ${oldVoiceId}`);
      const say = this.sayLeave(oldVoiceId, newMember.getDisplayName());
      promises.push(say);
    }
    await Promise.all(promises);
  }

  private async checkIfBotVoiceStateUpdate(
    voiceStateUpdateMemberId: string
  ): Promise<void> {
    if (voiceStateUpdateMemberId === this.client.id) {
      await this.store.saveConnections(
        this.client.getConnectedVoiceChannelIds()
      );
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
      logger.info(`Synthesized voice file at ${synthPath}`);
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
}
