import DiscordClientImpl from "@model/discord/discord-client-impl";
import {
  Client,
  ClientUser,
  Collection,
  StreamDispatcher,
  VoiceChannel,
  VoiceConnection
} from "discord.js";
import * as TypeMoq from "typemoq";

describe("Discord Client Implementation", () => {
  test("should get id from discord client", () => {
    const testClientId = "test client id";
    const mockClient = createMockClient(testClientId, true).object;
    const clientImpl = new DiscordClientImpl(mockClient);

    expect(clientImpl.id).toEqual(testClientId);
  });

  test("should be in voice channel", () => {
    const voiceId = "voice id";
    const mockClient = createMockClient("", true);
    const clientImpl = new DiscordClientImpl(mockClient.object);

    expect(clientImpl.isInVoiceChannel(voiceId)).toEqual(true);
  });

  test("should not be in voice channel", () => {
    const voiceId = "voice id";
    const mockClient = createMockClient("", false);
    const clientImpl = new DiscordClientImpl(mockClient.object);

    expect(clientImpl.isInVoiceChannel(voiceId)).toEqual(false);
  });

  function createMockUser(userId: string): TypeMoq.IMock<ClientUser> {
    const mock = TypeMoq.Mock.ofType<ClientUser>();
    mock.setup(u => u.id).returns(() => userId);
    return mock;
  }

  function createMockVoiceConnectionsCollection(
    voiceConnections: boolean
  ): TypeMoq.IMock<Collection<string, VoiceConnection>> {
    const mockCollection = TypeMoq.Mock.ofType<
      Collection<string, VoiceConnection>
    >();
    mockCollection
      .setup(c => c.some(TypeMoq.It.isAny()))
      .returns(() => voiceConnections);
    return mockCollection;
  }

  function createMockClient(
    userId: string,
    voiceConnections: boolean
  ): TypeMoq.IMock<Client> {
    const mock = TypeMoq.Mock.ofType<Client>();
    mock.setup(c => c.user).returns(() => createMockUser(userId).object);
    mock
      .setup(c => c.voiceConnections)
      .returns(
        () => createMockVoiceConnectionsCollection(voiceConnections).object
      );
    return mock;
  }
});
