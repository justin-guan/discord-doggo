import Prefix from "@store/commands/admin/prefix";
import ServerStats from "@store/commands/admin/server-stats";
import Command from "@store/commands/command";

export const Commands = new Set<Command>([new Prefix(), new ServerStats()]);
