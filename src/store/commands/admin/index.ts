import Trigger from "@store/commands/admin/trigger";
import Command from "@store/commands/command";

export const Commands = new Set<Command>([new Trigger()]);
