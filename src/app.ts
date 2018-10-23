import { discordToken } from "@config";
import DiscordMessenger from "@messenger/discord-messenger";

(async () => {
  await DiscordMessenger.login(discordToken);
  DiscordMessenger.start();
})();
