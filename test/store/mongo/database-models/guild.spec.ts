import { Guild } from "@store/mongo/database-models/guild";

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
});
