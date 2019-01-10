import Client from "@model/base/client";
import { Client as DiscordClient } from "discord.js";

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

  public async playFile(voiceChannelId: string, file: string): Promise<void> {
    const connection = this.client.voiceConnections.find(
      vc => vc.channel.id === voiceChannelId
    );
    if (connection) {
      await connection.playFile(file);
    } else {
      return Promise.reject("Client is not connected to the voice channel");
    }
  }
}