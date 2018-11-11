import Command from "@store/commands/command";
import CommandStore from "@store/commands/command-store";

describe("Command Store", () => {
  const commandStore = new CommandStore();
  const testServerId = "test server id";
  const badCommandName = "NOT A COMMAND";

  test.each(["ping"])(
    "should find the %s basic command",
    (commandName: string) => {
      const command = commandStore.getCommand(testServerId, commandName);

      expect(command).not.toBeUndefined();
      const c = command as Command;
      expect(c.getCommandName()).toEqual(commandName);
    }
  );

  test("should fail to find command", () => {
    const command = commandStore.getCommand(testServerId, badCommandName);

    expect(command).toBeUndefined();
  });
});
