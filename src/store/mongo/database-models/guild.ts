import { CustomCommand, CustomCommandType } from "@store/models/custom-command";
import Guild from "@store/models/guild";
import { model, Document, Model, Schema } from "mongoose";

interface GuildDocument extends Document {
  _id: string;
  commandPrefix: string;
  commands: CustomCommand[];

  changeCommandPrefix(newPrefix: string): void;
  addNewCommand(command: CustomCommand): void;
  removeCommand(commandName: string): boolean;
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
    default: "!"
  },
  commands: [
    {
      name: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      type: {
        type: Number,
        enum: [CustomCommandType.VOICE, CustomCommandType.TEXT],
        required: true
      },
      action: {
        type: String,
        required: true
      },
      cost: {
        type: Number,
        default: 0,
        required: true
      }
    }
  ]
});

// methods
schema.methods.changeCommandPrefix = function changeCommandPrefix(
  newPrefix: string
): void {
  this.commandPrefix = newPrefix;
};

schema.methods.addNewCommand = function addNewCommand(
  customCommand: CustomCommand
): void {
  const filter: CustomCommand[] = this.commands.filter(
    (command: CustomCommand) => command.name === customCommand.name
  );
  if (filter.length > 0) {
    throw new Error(
      `Tried adding an already existing command: ${customCommand.name}`
    );
  }
  this.commands.push(customCommand);
};

schema.methods.removeCommand = function removeCommand(
  commandName: string
): boolean {
  const length = this.commands.length;
  this.commands = this.commands.filter(
    (command: CustomCommand) => command.name !== commandName
  );
  const newLength = this.commands.length;
  return length !== newLength;
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

  public getId(): string {
    return this.guild._id;
  }

  public getCommandPrefix(): string {
    return this.guild.commandPrefix;
  }

  public setCommandPrefix(newPrefix: string): void {
    this.guild.changeCommandPrefix(newPrefix);
  }

  public async save(): Promise<Guild> {
    await this.guild.save();
    return this;
  }

  public addNewCustomCommand(command: CustomCommand): void {
    this.guild.addNewCommand(command);
  }

  public removeCustomCommand(commandName: string): boolean {
    return this.guild.removeCommand(commandName);
  }

  public getCustomCommand(commandName: string): CustomCommand | undefined {
    return this.guild.commands.find(
      customCommand => customCommand.name === commandName
    );
  }
}

export const Guild = model<GuildDocument>("Guild", schema) as GuildModel;
