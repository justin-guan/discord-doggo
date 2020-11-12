import { Collection as MockCollection } from "../../mocks/discord.js/collection";
import { VoiceChannel as MockVoiceChannel } from "../../mocks/discord.js/voice-channel";
jest.mock("discord.js", () => {
  return {
    VoiceChannel: MockVoiceChannel,
    Collection: MockCollection
  };
});

import DiscordClientImpl from "@model/discord/discord-client-impl";
import {
  Client,
  ClientUser,
  ClientVoiceManager,
  Collection,
  VoiceChannel,
  VoiceConnection
} from "discord.js";
import * as TypeMoq from "typemoq";

describe("Discord Client Implementation", () => {
  test("should get id from discord client", () => {
    const testClientId = "test client id";
    const mockClient = createMockClient(testClientId, []).object;
    const clientImpl = new DiscordClientImpl(mockClient);

    expect(clientImpl.id).toEqual(testClientId);
  });

  test("should be in voice channel", () => {
    const voiceId = "voice id";
    const mockClient = createMockClient("", [voiceId]);
    const clientImpl = new DiscordClientImpl(mockClient.object);

    expect(clientImpl.isInVoiceChannel(voiceId)).toEqual(true);
  });

  test("should not be in voice channel", () => {
    const voiceId = "voice id";
    const mockClient = createMockClient("", []);
    const clientImpl = new DiscordClientImpl(mockClient.object);

    expect(clientImpl.isInVoiceChannel(voiceId)).toEqual(false);
  });

  test("should get all voice channels that the client is in", () => {
    const voiceId1 = "voice id 1";
    const voiceId2 = "voice id 2";
    const voiceIds = [voiceId1, voiceId2];
    const mockClient = createMockClient("", voiceIds);
    const clientImpl = new DiscordClientImpl(mockClient.object);

    const voiceChannelIds = clientImpl.getConnectedVoiceChannelIds();

    expect(voiceChannelIds).toHaveLength(voiceIds.length);
    expect(voiceChannelIds[0]).toEqual(voiceId1);
    expect(voiceChannelIds[1]).toEqual(voiceId2);
  });

  test("should get no voice channels because the client is not in any", () => {
    const mockClient = createMockClient("", []);
    const clientImpl = new DiscordClientImpl(mockClient.object);

    const voiceChannelIds = clientImpl.getConnectedVoiceChannelIds();

    expect(voiceChannelIds).toHaveLength(0);
  });

  function createMockUser(userId: string): TypeMoq.IMock<ClientUser> {
    const mock = TypeMoq.Mock.ofType<ClientUser>();
    mock.setup(u => u.id).returns(() => userId);
    return mock;
  }

  function createMockVoiceConnection(
    id: string
  ): TypeMoq.IMock<VoiceConnection> {
    const mock = TypeMoq.Mock.ofType<VoiceConnection>();
    mock
      .setup(vc => vc.channel)
      .returns(() => createMockVoiceChannel(id).object);
    return mock;
  }

  function createMockVoiceChannel(id: string): TypeMoq.IMock<VoiceChannel> {
    const mock = TypeMoq.Mock.ofType<VoiceChannel>();
    mock.setup(vc => vc.id).returns(() => id);
    return mock;
  }

  function createMockClient(
    userId: string,
    voiceConnectionGuildId: string[]
  ): TypeMoq.IMock<Client> {
    const mock = TypeMoq.Mock.ofType<Client>();
    mock.setup(c => c.user).returns(() => createMockUser(userId).object);
    mock.setup(c => c.voice).returns(() => {
      const collection = new Collection<string, VoiceConnection>();
      voiceConnectionGuildId.forEach((id, idx) => {
        collection.set(idx.toString(), createMockVoiceConnection(id).object);
      });
      const mockClientVoiceManager = TypeMoq.Mock.ofType<ClientVoiceManager>();
      mockClientVoiceManager
        .setup(m => m.connections)
        .returns(() => collection);
      return mockClientVoiceManager.object;
    });
    return mock;
  }
});
