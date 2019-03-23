import Banish from "@store/commands/basic/banish";
import Create from "@store/commands/basic/create";
import Help from "@store/commands/basic/help";
import Ping from "@store/commands/basic/ping";
import Summon from "@store/commands/basic/summon";
import Command from "@store/commands/command";
import Delete from "./delete";

export const Commands = new Set<Command>([
  new Ping(),
  new Help(),
  new Summon(),
  new Banish(),
  new Create(),
  new Delete()
]);
