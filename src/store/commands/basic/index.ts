import Help from "@store/commands/basic/help";
import Ping from "@store/commands/basic/ping";
import Command from "@store/commands/command";

export const Commands = new Set<Command>([new Ping(), new Help()]);
