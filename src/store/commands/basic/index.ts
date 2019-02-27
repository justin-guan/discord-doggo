import Banish from "@store/commands/basic/banish";
import Help from "@store/commands/basic/help";
import Ping from "@store/commands/basic/ping";
import Stats from "@store/commands/basic/stats";
import Summon from "@store/commands/basic/summon";
import Command from "@store/commands/command";

export const Commands = new Set<Command>([
  new Ping(),
  new Help(),
  new Summon(),
  new Banish(),
  new Stats()
]);
