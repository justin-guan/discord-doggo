const voiceUrl = "http://voiceurl.com/";
jest.mock("@config", () => {
  return {
    discordToken: "discord token",
    voiceUrl,
    mongoDbUrl: "mongo db url"
  };
});

import VoiceSynthesizer from "@handlers/base/voice-synthesizer";
import fs from "fs";
import mock from "mock-fs";
import nock from "nock";

const RESPONSE_OK_CODE = 200;
const RESPONSE_UNAUTHORIZED_CODE = 404;

describe("Voice Synthesizer", () => {
  const voiceSynthesizer = new VoiceSynthesizer();
  const existingTestFile = "file.mp3";
  const nonExistingTestFile = "nonexistent.mp3";

  beforeEach(() => {
    const config: mock.Config = {};
    config[existingTestFile] = Buffer.from([0, 0, 0]);
    mock(config);
  });

  afterEach(() => {
    mock.restore();
    nock.cleanAll();
  });

  test("should find an already existing file", async () => {
    const result = voiceSynthesizer.synthesize("test", existingTestFile);

    await expect(result).resolves.toEqual(existingTestFile);
  });

  test("should download and save the voice synthesis", async () => {
    const synthesisText = "test";
    nock(voiceUrl)
      .get("/" + synthesisText)
      .reply(RESPONSE_OK_CODE, Buffer.from([1, 0, 1]));

    expect(fs.existsSync(nonExistingTestFile)).toEqual(false);

    const result = voiceSynthesizer.synthesize(
      synthesisText,
      nonExistingTestFile
    );

    await expect(result).resolves.toEqual(nonExistingTestFile);
    expect(fs.existsSync(nonExistingTestFile)).toEqual(true);
  });

  test("should fail to download and save the voice synthesis", async () => {
    const synthesisText = "test";
    nock(voiceUrl)
      .get("/" + synthesisText)
      .reply(RESPONSE_UNAUTHORIZED_CODE, "failed");

    expect(fs.existsSync(nonExistingTestFile)).toEqual(false);

    const result = voiceSynthesizer.synthesize(
      synthesisText,
      nonExistingTestFile
    );

    await expect(result).rejects.toBeInstanceOf(Error);
    expect(fs.existsSync(nonExistingTestFile)).toEqual(false);
  });
});
