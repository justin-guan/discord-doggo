import { ClientVoiceConnectionsConfig } from "@store/mongo/database-models/client-voice-connections-config";

describe("Mongoose Client Voice Connections Config Schema", () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  test("should be valid if voice channel ids are not provided", () => {
    const clientConfig = new ClientVoiceConnectionsConfig();

    clientConfig.validate(error => {
      expect(error).toBeFalsy();
    });
  });

  test("should have the given voice channel id save in the config", () => {
    const testVoiceChannelId = "test voice channel id";
    const clientConfig = new ClientVoiceConnectionsConfig({
      voiceChannelIds: [testVoiceChannelId]
    });

    expect(clientConfig.voiceChannelIds).toEqual(
      expect.arrayContaining([testVoiceChannelId])
    );
  });

  test("should save a new set of voice connection", () => {
    const testVoiceChannelId1 = "test voice channel id 1";
    const testVoiceChannelId2 = "test voice channel id 2";
    const clientConfig = new ClientVoiceConnectionsConfig({
      voiceChannelIds: [testVoiceChannelId1]
    });

    expect(clientConfig.voiceChannelIds).toEqual(
      expect.arrayContaining([testVoiceChannelId1])
    );

    clientConfig.saveConnections([testVoiceChannelId2]);

    expect(clientConfig.voiceChannelIds).toEqual(
      expect.arrayContaining([testVoiceChannelId2])
    );
  });

  test("should find the client voice connections config", async () => {
    const testVoiceChannelId = "test voice channel id";
    const clientConfig = new ClientVoiceConnectionsConfig({
      voiceChannelIds: [testVoiceChannelId]
    });
    jest
      .spyOn(ClientVoiceConnectionsConfig, "findOne")
      .mockImplementation(() => {
        return {
          exec: () => Promise.resolve(clientConfig)
        };
      });

    const result = await ClientVoiceConnectionsConfig.getConnectionsConfig();

    expect(result.getLastJoinedVoiceChannelIds()).toEqual(
      expect.arrayContaining([testVoiceChannelId])
    );
  });

  test("should fail to find the client voice connections config", async () => {
    const testError = new Error();
    jest
      .spyOn(ClientVoiceConnectionsConfig, "findOne")
      .mockImplementation(() => {
        return {
          exec: () => Promise.reject(testError)
        };
      });

    const result = ClientVoiceConnectionsConfig.getConnectionsConfig();

    await expect(result).rejects.toBe(testError);
  });

  test("should create a new client voice connections config if it fails to find one", async () => {
    jest
      .spyOn(ClientVoiceConnectionsConfig, "findOne")
      .mockImplementation(() => {
        return {
          exec: () => Promise.resolve(null)
        };
      });
    const mockSave = jest.fn(() => Promise.resolve());
    ClientVoiceConnectionsConfig.prototype.save = mockSave;

    const result = await ClientVoiceConnectionsConfig.getConnectionsConfig();

    expect(result).not.toBeNull();
    expect(result.getLastJoinedVoiceChannelIds()).toHaveLength(0);
    expect(mockSave).toBeCalledTimes(1);
  });

  test("should return a client voice connections config based on mongoose model", async () => {
    const testVoiceChannelId = "test voice channel id";
    const clientConfig = new ClientVoiceConnectionsConfig({
      voiceChannelIds: [testVoiceChannelId]
    });
    jest
      .spyOn(ClientVoiceConnectionsConfig, "findOne")
      .mockImplementation(() => {
        return {
          exec: () => Promise.resolve(clientConfig)
        };
      });
    const mockSaveConnections = jest.fn();
    const mockSave = jest.fn(() => Promise.resolve());
    ClientVoiceConnectionsConfig.prototype.saveConnections = mockSaveConnections;
    ClientVoiceConnectionsConfig.prototype.save = mockSave;

    const result = await ClientVoiceConnectionsConfig.getConnectionsConfig();

    expect(mockSaveConnections).not.toBeCalled();
    expect(mockSave).not.toBeCalled();
    expect(result.getLastJoinedVoiceChannelIds()).toEqual(
      expect.arrayContaining([testVoiceChannelId])
    );

    result.saveConnectedVoiceChannelIds([]);

    expect(mockSaveConnections).toBeCalledTimes(1);
    expect(mockSave).toBeCalledTimes(1);
  });
});
