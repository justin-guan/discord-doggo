import { EmojiCounter, EmojiType } from "@model/base/emoji-counter";

describe("Emoji Counter", () => {
  const testEmojiIdentifier = "identifier";

  test("should create a counter for unicode emojis", () => {
    const emojiCounter = new EmojiCounter(
      testEmojiIdentifier,
      EmojiType.UNICODE
    );

    expect(emojiCounter.identifier).toEqual(testEmojiIdentifier);
    expect(emojiCounter.type).toEqual(EmojiType.UNICODE);
  });

  test("should create a counter for custom emojis", () => {
    const emojiCounter = new EmojiCounter(
      testEmojiIdentifier,
      EmojiType.CUSTOM
    );

    expect(emojiCounter.identifier).toEqual(testEmojiIdentifier);
    expect(emojiCounter.type).toEqual(EmojiType.CUSTOM);
  });

  test("should add zero to the counter", () => {
    const emojiCounter = new EmojiCounter(
      testEmojiIdentifier,
      EmojiType.UNICODE
    );

    expect(emojiCounter.count).toEqual(0);

    emojiCounter.add(0);

    expect(emojiCounter.count).toEqual(0);
  });

  test("should add one to the counter", () => {
    const emojiCounter = new EmojiCounter(
      testEmojiIdentifier,
      EmojiType.UNICODE
    );

    expect(emojiCounter.count).toEqual(0);

    emojiCounter.add(1);

    expect(emojiCounter.count).toEqual(1);
  });

  test("should add multiple to the counter", () => {
    const numToAdd = 100;
    const emojiCounter = new EmojiCounter(
      testEmojiIdentifier,
      EmojiType.UNICODE
    );

    expect(emojiCounter.count).toEqual(0);

    emojiCounter.add(numToAdd);

    expect(emojiCounter.count).toEqual(numToAdd);
  });
});
