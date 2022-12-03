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
    logger.error(e);
    logger.error("Unable to start bot");
  }
})();

const stopMessenger = async () => {
  await messenger.stop();
  logger.info("Bot stopped!");
};
const registerStop = (signal: string) => process.on(signal, stopMessenger);

["SIGINT", "SIGTERM", "SIGQUIT"].forEach(registerStop);
