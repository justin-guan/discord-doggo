import DiscordCustomEmoji from "@model/discord/discord-custom-emoji";

describe("Discord Custom Emoji", () => {
  const testDiscordCustomEmojiId = "305818615712579584";
  const testDiscordCustomEmojiString = `<:ayy:${testDiscordCustomEmojiId}>`;
  const notADiscordCustomEmojiString = "asdf";

  test("should parse the id from a discord emoji string", () => {
    const discordCustomEmoji = new DiscordCustomEmoji(
      testDiscordCustomEmojiString
    );

    expect(discordCustomEmoji.id).toEqual(testDiscordCustomEmojiId);
  });

  test("should fail to parse the id from a discord emoji string", () => {
    const badDiscordEmojiCreation = () => {
      return new DiscordCustomEmoji(notADiscordCustomEmojiString);
    };

    expect(badDiscordEmojiCreation).toThrow();
  });
});
