import logger = require("@logger");
import Client from "@model/base/client";
import { Client as DiscordClient, TextChannel, VoiceChannel } from "discord.js";

export default class DiscordClientImpl implements Client {
  private readonly client: DiscordClient;

  constructor(client: DiscordClient) {
    this.client = client;
  }

  public get id(): string {
    return this.client.user.id;
  }

  public isInVoiceChannel(channelId: string): boolean {
    return this.client.voiceConnections.some(vc => vc.channel.id === channelId);
  }

  public getConnectedVoiceChannelIds(): string[] {
    return this.client.voiceConnections.map(vc => vc.channel.id);
  }

  public async joinVoiceChannel(voiceChannelId: string): Promise<void> {
    const channel = this.client.channels.get(voiceChannelId);
    if (channel instanceof VoiceChannel) {
      await (channel as VoiceChannel).join();
    } else {
      return Promise.reject(
        new Error(`${voiceChannelId} is not a joinable voice channel`)
      );
    }
  }

  public async playFile(voiceChannelId: string, file: string): Promise<void> {
    const connection = this.client.voiceConnections.find(
      vc => vc.channel.id === voiceChannelId
    );
    if (connection) {
      function getPausedTime(): number {
        // tslint:disable-next-line:no-any
        return (connection.player as any).streamingData.pausedTime;
      }
      logger.info(`Before play file Paused time: ${getPausedTime()}`);
      await connection.playFile(file);
      logger.info(`After play file Paused time: ${getPausedTime()}`);
      // tslint:disable-next-line:no-any
      (connection.player as any).streamingData.pausedTime = 0;
    } else {
      return Promise.reject("Client is not connected to the voice channel");
    }
  }
}
