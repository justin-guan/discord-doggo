import { CustomCommand, CustomCommandType } from "@store/models/custom-command";
import { Guild } from "@store/mongo/database-models/guild";
import testDataGenerator from "../../../utils/test-data-generator";

describe("Mongoose Guild Schema", () => {
  const testGuildId = "test id";

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test("should be invalid if the id is not provided", () => {
    const guild = new Guild({
      commandPrefix: ""
    });

    guild.validate(error => {
      expect(error).toBeTruthy();
    });
  });

  test("should be valid if the command prefix is not provided", () => {
    const guild = new Guild({
      _id: testGuildId
    });

    guild.validate(error => {
      expect(error).toBeFalsy();
    });
  });

  test("should be ! command prefix if none is provided", () => {
    const guild = new Guild({
      _id: testGuildId
    });

    expect(guild.commandPrefix).toEqual("!");
  });

  test("should change the command prefix", () => {
    const newCommandPrefix = "?";
    const guild = new Guild({
      _id: testGuildId
    });

    expect(guild.commandPrefix).toEqual("!");

    guild.changeCommandPrefix(newCommandPrefix);

    expect(guild.commandPrefix).toEqual(newCommandPrefix);
  });

  test("should find all guilds", async () => {
    const guild = new Guild({
      _id: testGuildId
    });
    jest.spyOn(Guild, "find").mockImplementation(() => {
      return {
        exec: () => Promise.resolve([guild])
      };
    });

    const result = await Guild.findAllGuilds();

    expect(result).toHaveLength(1);
    expect(result[0].getId()).toEqual(guild.id);
  });

  test("should fail to find all guilds", async () => {
    const testError = new Error();
    jest.spyOn(Guild, "find").mockImplementation(() => {
      return {
        exec: () => Promise.reject(testError)
      };
    });

    const result = Guild.findAllGuilds();

    await expect(result).rejects.toBe(testError);
  });

  test("should find a guild based on its id", async () => {
    const guild = new Guild({
      _id: testGuildId
    });
    jest.spyOn(Guild, "findOne").mockImplementation(() => {
      return {
        exec: () => Promise.resolve(guild)
      };
    });

    const result = await Guild.findGuild(testGuildId);

    expect(result.getId()).toEqual(testGuildId);
  });

  test("should fail to find a guild based on its id", async () => {
    const testError = new Error();
    jest.spyOn(Guild, "findOne").mockImplementation(() => {
      return {
        exec: () => Promise.reject(testError)
      };
    });

    const result = Guild.findGuild(testGuildId);

    await expect(result).rejects.toBe(testError);
  });

  test("should create a guild and save it if it fails to find guild with given id", async () => {
    jest.spyOn(Guild, "findOne").mockImplementation(() => {
      return {
        exec: () => Promise.resolve(null)
      };
    });
    const mockSave = jest.fn(() => {
      return Promise.resolve();
    });
    Guild.prototype.save = mockSave;

    const result = await Guild.findGuild(testGuildId);

    expect(result).not.toBeNull();
    expect(result.getId()).toEqual(testGuildId);
    expect(mockSave).toBeCalledTimes(1);
  });

  test("should return a guild based on mongoose model", async () => {
    const testCommandPrefix = "?";
    const guild = new Guild({
      _id: testGuildId,
      commandPrefix: testCommandPrefix
    });
    jest.spyOn(Guild, "findOne").mockImplementation(() => {
      return {
        exec: () => Promise.resolve(guild)
      };
    });
    const mockChangeCommandPrefix = jest.fn();
    const mockSave = jest.fn(() => Promise.resolve());
    Guild.prototype.changeCommandPrefix = mockChangeCommandPrefix;
    Guild.prototype.save = mockSave;

    const result = await Guild.findGuild(testGuildId);

    expect(mockChangeCommandPrefix).not.toBeCalled();
    expect(mockSave).not.toBeCalled();

    expect(result.getId()).toEqual(testGuildId);
    expect(result.getCommandPrefix()).toEqual(testCommandPrefix);
    result.setCommandPrefix("");
    expect(mockChangeCommandPrefix).toBeCalledTimes(1);
    result.save();
    expect(mockSave).toBeCalledTimes(1);
  });

  test("should add a new command to guild", async () => {
    const testCommandName = "test";
    const guild = new Guild({
      _id: testGuildId
    });

    jest.spyOn(Guild, "findOne").mockImplementation(() => {
      return {
        exec: () => Promise.resolve(guild)
      };
    });
    const g = await Guild.findGuild(testGuildId);

    g.addNewCustomCommand(generateTestCustomCommand(testCommandName));

    expect(guild.commands).toContainEqual(
      expect.objectContaining({
        name: testCommandName
      })
    );
  });

  test("should not add a command that already exists to guild", async () => {
    const testCommandName = "test";
    const guild = new Guild({
      _id: testGuildId,
      commands: [generateTestCustomCommand(testCommandName)]
    });

    jest.spyOn(Guild, "findOne").mockImplementation(() => {
      return {
        exec: () => Promise.resolve(guild)
      };
    });
    const g = await Guild.findGuild(testGuildId);

    expect(() =>
      g.addNewCustomCommand(generateTestCustomCommand(testCommandName))
    ).toThrow();
  });

  test("should remove an existing command from a guild", async () => {
    const testCommandName = "test";
    const guild = new Guild({
      _id: testGuildId,
      commands: [generateTestCustomCommand(testCommandName)]
    });
    jest.spyOn(Guild, "findOne").mockImplementation(() => {
      return {
        exec: () => Promise.resolve(guild)
      };
    });
    const g = await Guild.findGuild(testGuildId);

    g.removeCustomCommand(testCommandName);

    expect(guild.commands).not.toContainEqual(
      expect.objectContaining({
        name: testCommandName
      })
    );
  });

  test("should do nothing when trying to remove a command that does not exist", async () => {
    const testCommandName1 = "test1";
    const testCommandName2 = "test2";
    const guild = new Guild({
      _id: testGuildId,
      commands: [generateTestCustomCommand(testCommandName1)]
    });
    jest.spyOn(Guild, "findOne").mockImplementation(() => {
      return {
        exec: () => Promise.resolve(guild)
      };
    });
    const g = await Guild.findGuild(testGuildId);

    expect(guild.commands).not.toContainEqual(
      expect.objectContaining({
        name: testCommandName2
      })
    );

    g.removeCustomCommand(testCommandName2);

    expect(guild.commands).toHaveLength(1);
    expect(guild.commands).toContainEqual(
      expect.objectContaining({
        name: testCommandName1
      })
    );
    expect(guild.commands).not.toContainEqual(
      expect.objectContaining({
        name: testCommandName2
      })
    );
  });

  test("should find a custom command in guild", async () => {
    const testCommandName = "test";
    const testCustomCommand = generateTestCustomCommand(testCommandName);
    const guild = new Guild({
      _id: testGuildId,
      commands: [testCustomCommand]
    });
    jest.spyOn(Guild, "findOne").mockImplementation(() => {
      return {
        exec: () => Promise.resolve(guild)
      };
    });
    const g = await Guild.findGuild(testGuildId);

    const command = g.getCustomCommand(testCommandName);

    expect(command).not.toBeUndefined();
    const c = command as CustomCommand;
    expect(c.name).toEqual(testCustomCommand.name);
    expect(c.description).toEqual(testCustomCommand.description);
    expect(c.type).toEqual(testCustomCommand.type);
    expect(c.action).toEqual(testCustomCommand.action);
    expect(c.cost).toEqual(testCustomCommand.cost);
  });

  test("should not find a custom command in guild", async () => {
    const testCommandName = "test";
    const guild = new Guild({
      _id: testGuildId,
      commands: []
    });
    jest.spyOn(Guild, "findOne").mockImplementation(() => {
      return {
        exec: () => Promise.resolve(guild)
      };
    });
    const g = await Guild.findGuild(testGuildId);

    const command = g.getCustomCommand(testCommandName);

    expect(command).toBeUndefined();
  });

  function generateTestCustomCommand(commandName: string): CustomCommand {
    return testDataGenerator.generateCustomCommand({
      name: commandName
    });
  }
});
