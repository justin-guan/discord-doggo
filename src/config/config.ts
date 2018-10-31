import logger from "@logger";
import convict from "convict";

const config = convict({
  voice: {
    url: {
      doc: "The voice service API url",
      default: "",
      env: "VOICE_URL"
    }
  },
  discord: {
    token: {
      doc: "The Discord Bot Token",
      default: "",
      env: "DISCORD_TOKEN"
    }
  },
  mongodb: {
    url: {
      doc: "The MongoDB url to connect to",
      default: "",
      env: "MONGODB_URL"
    }
  }
});

if (!config.get("discord.token")) {
  logger.error("Discord Token is missing!");
  process.exit(1);
}

if (!config.get("voice.url")) {
  logger.error("Voice service url is missing!");
  process.exit(1);
}

if (!config.get("mongodb.url")) {
  logger.error("MongoDB url is missing!");
  process.exit(1);
}

config.validate();

export const discordToken: string = config.get("discord.token");
export const voiceUrl: string = config.get("voice.url");
export const mongoDbUrl: string = config.get("mongodb.url");
