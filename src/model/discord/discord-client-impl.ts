import Client from "@model/base/client";
import { Client as DiscordClient, TextChannel, VoiceChannel } from "discord.js";

export default class DiscordClientImpl implements Client {
  private readonly client: DiscordClient;

  constructor(client: DiscordClient) {
    this.client = client;
  }

  public get id(): string {
    const throwError = () => {
      throw Error("Client user is not associated with an ID");
    };
    return this.client.user ? this.client.user.id : throwError();
  }

  public isInVoiceChannel(channelId: string): boolean {
    return this.client.voice
      ? this.client.voice.connections.some(vc => vc.channel.id === channelId)
      : false;
  }

  public getConnectedVoiceChannelIds(): string[] {
    return this.client.voice
      ? this.client.voice.connections.map(vc => vc.channel.id)
      : [];
  }

  public async joinVoiceChannel(voiceChannelId: string): Promise<void> {
    const channel = this.client.channels.cache.get(voiceChannelId);
    if (channel instanceof VoiceChannel) {
      await (channel as VoiceChannel).join();
    } else {
      return Promise.reject(
        new Error(`${voiceChannelId} is not a joinable voice channel`)
      );
    }
  }

  public async play(voiceChannelId: string, url: string): Promise<void> {
    const connection = this.client.voice
      ? this.client.voice.connections.find(
          vc => vc.channel.id === voiceChannelId
        )
      : null;
    if (connection) {
      // tslint:disable-next-line:no-any
      // TODO: Investigate if this is still necessary with v12 changes
      // (connection.player as any).streamingData.pausedTime = 0;
      await connection.play(url);
    } else {
      return Promise.reject("Client is not connected to the voice channel");
    }
  }
}
