import Prefix from "@store/commands/admin/prefix";
import Command from "@store/commands/command";

export const Commands = new Set<Command>([new Prefix()]);
