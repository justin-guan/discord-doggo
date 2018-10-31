import { discordToken } from "@config";
import logger = require("@logger");
import messenger from "@messenger/discord/discord-messenger";

(async () => {
  try {
    await messenger.start(discordToken);
  } catch (e) {
    logger.error("Unable to login: Invalid discord token provided");
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
