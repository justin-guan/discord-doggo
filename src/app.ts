import { discordToken } from "@config";
import messenger from "@messenger/discord/discord-messenger";

(async () => {
  await messenger.start(discordToken);
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
