import ClientVoiceConnectionsConfig from "@store/models/client-voice-connections-config";
import { model, Document, Model, Schema } from "mongoose";

interface ClientVoiceConnectionsConfigDocument extends Document {
  voiceChannelIds: string[];

  saveConnections(voiceChannelIds: string[]): void;
}

interface ClientVoiceConnectionsConfigModel
  extends Model<ClientVoiceConnectionsConfigDocument> {
  getConnectionsConfig(): Promise<ClientVoiceConnectionsConfig>;
}

const schema = new Schema({
  setting: {
    type: String,
    default: "connections",
    required: true
  },
  voiceChannelIds: [String]
});

// methods
schema.methods.saveConnections = function saveConnections(
  voiceChannelIds: string[]
): void {
  this.voiceChannelIds = voiceChannelIds;
};

// statics
schema.statics.getConnectionsConfig = async function getConnectionsConfig(): Promise<
  ClientVoiceConnectionsConfig
> {
  const config = await ClientConfig.findOne({ setting: "connections" });
  if (config !== null) {
    return new StoreVoiceConnectionsClientConfig(config);
  }
  const newConfig = new ClientConfig();
  await newConfig.save();
  return new StoreVoiceConnectionsClientConfig(newConfig);
};

class StoreVoiceConnectionsClientConfig
  implements ClientVoiceConnectionsConfig {
  private clientConfig: ClientVoiceConnectionsConfigDocument;

  constructor(clientConfig: ClientVoiceConnectionsConfigDocument) {
    this.clientConfig = clientConfig;
  }

  public getLastJoinedVoiceChannelIds(): string[] {
    return this.clientConfig.voiceChannelIds;
  }

  public async saveConnectedVoiceChannelIds(
    voiceChannelIds: string[]
  ): Promise<void> {
    this.clientConfig.saveConnections(voiceChannelIds);
    await this.clientConfig.save();
  }
}

export const ClientConfig = model<ClientVoiceConnectionsConfigDocument>(
  "ClientConfig",
  schema
) as ClientVoiceConnectionsConfigModel;
