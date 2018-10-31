import Guild from "@store/models/guild";
import { model, Document, Model, Schema } from "mongoose";

interface GuildDocument extends Document {
  _id: string;
  commandPrefix: string;

  changeCommandPrefix(newPrefix: string): void;
}

interface GuildModel extends Model<GuildDocument> {
  findAllGuilds(): Promise<Guild[]>;
  findGuild(id: string): Promise<Guild>;
}

const schema = new Schema({
  _id: {
    type: String,
    required: true
  },
  commandPrefix: {
    type: String,
    required: true,
    default: "!"
  }
});

// methods
schema.methods.changeCommandPrefix = function changeCommandPrefix(
  newPrefix: string
): void {
  this.commandPrefix = newPrefix;
};

// statics
schema.statics.findAllGuilds = async function findAllGuilds(): Promise<
  Guild[]
> {
  const guilds = await Guild.find({}).exec();
  return guilds.map(guildDocument => new StoreGuild(guildDocument));
};

schema.statics.findGuild = async function findGuild(
  id: string
): Promise<Guild> {
  const guildDocument = await Guild.findOne({ _id: id }).exec();
  if (guildDocument !== null) {
    return new StoreGuild(guildDocument);
  }
  const newGuildDocument = new Guild({ _id: id });
  const storeGuild = new StoreGuild(newGuildDocument);
  await storeGuild.save();
  return storeGuild;
};

class StoreGuild implements Guild {
  private guild: GuildDocument;

  constructor(guild: GuildDocument) {
    this.guild = guild;
  }

  public setCommandPrefix(newPrefix: string): void {
    this.guild.changeCommandPrefix(newPrefix);
  }

  public async save(): Promise<Guild> {
    await this.guild.save();
    return this;
  }
}

export const Guild = model<GuildDocument>("Guild", schema) as GuildModel;
