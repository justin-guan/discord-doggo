import { discordToken, mongoDbUrl } from "@config";
import logger = require("@logger");
import messenger from "@messenger/discord/discord-messenger";

(async () => {
  try {
    await messenger.start({
      messengerToken: discordToken,
      databaseUrl: mongoDbUrl
    });
  } catch (e) {
    logger.error("Unable to start messenger");
  }
})();

process.on("SIGINT", async () => {
  await messenger.stop();
});

process.on("SIGTERM", async () => {
  await messenger.stop();
});

process.on("SIGQUIT", async () => {
  await messenger.stop();
});
