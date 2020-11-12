import DiscordMemberImpl from "@model/discord/discord-member-impl";
import { GuildMember, User, VoiceChannel, VoiceState } from "discord.js";
import * as TypeMoq from "typemoq";

describe("Discord Member Implementation", () => {
  const testId = "test id";
  const testVoiceId = "test voice id";
  const testUserName = "test user name";
  const testNickname = "test nick name";

  test("should get properties from discord member id", () => {
    const mockVoiceState = createMockVoiceState(
      testId,
      testVoiceId,
      testUserName,
      testNickname
    ).object;

    const memberImpl = new DiscordMemberImpl(mockVoiceState);

    expect(memberImpl.id).toEqual(testId);
    expect(memberImpl.voiceChannelId).toEqual(testVoiceId);
  });

  test("should get nickname as display name if it exists", () => {
    const mockVoiceState = createMockVoiceState(
      testId,
      testVoiceId,
      testUserName,
      testNickname
    ).object;

    const memberImpl = new DiscordMemberImpl(mockVoiceState);

    expect(memberImpl.getDisplayName()).toEqual(testNickname);
  });

  function createMockVoiceState(
    id: string,
    voiceId: string,
    username: string,
    nickname: string
  ): TypeMoq.IMock<VoiceState> {
    const mock = TypeMoq.Mock.ofType<VoiceState>();
    mock.setup(m => m.id).returns(() => id);
    mock
      .setup(m => m.member)
      .returns(() => createMockMember(id, username, nickname).object);
    mock
      .setup(m => m.channel)
      .returns(() => createMockVoiceChannel(voiceId).object);
    return mock;
  }

  function createMockMember(
    id: string,
    username: string,
    nickname: string
  ): TypeMoq.IMock<GuildMember> {
    const mock = TypeMoq.Mock.ofType<GuildMember>();
    const mockUser = TypeMoq.Mock.ofType<User>();
    mockUser.setup(u => u.username).returns(() => username);
    mock.setup(m => m.user).returns(() => mockUser.object);
    mock.setup(m => m.id).returns(() => id);
    mock.setup(m => m.nickname).returns(() => nickname);
    return mock;
  }

  function createMockVoiceChannel(
    voiceId: string
  ): TypeMoq.IMock<VoiceChannel> {
    const mock = TypeMoq.Mock.ofType<VoiceChannel>();
    mock.setup(m => m.id).returns(() => voiceId);
    return mock;
  }
});
