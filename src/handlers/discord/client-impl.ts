import Client from "@handlers/base/client";
import { Client as DiscordClient } from "discord.js";

export default class ClientImpl implements Client {
  private readonly client: DiscordClient;

  constructor(client: DiscordClient) {
    this.client = client;
  }

  public get id(): string {
    return this.client.user.id;
  }

  public isInVoiceChannel(channelId: string): boolean {
    return this.client.voiceConnections.exists("channel", channelId);
  }

  public async playFile(voiceChannelId: string, file: string): Promise<void> {
    const connection = this.client.voiceConnections.get(voiceChannelId);
    if (connection) {
      await connection.playFile(file);
    } else {
      return Promise.reject("Client is not connected to the voice channel");
    }
  }
}
