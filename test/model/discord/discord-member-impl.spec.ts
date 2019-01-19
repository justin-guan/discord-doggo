import DiscordMemberImpl from "@model/discord/discord-member-impl";
import { GuildMember, User } from "discord.js";
import * as TypeMoq from "typemoq";

describe("Discord Member Implementation", () => {
  const testId = "test id";
  const testVoiceId = "test voice id";
  const testUserName = "test user name";
  const testNickname = "test nick name";

  test("should get properties from discord member id", () => {
    const mockMember = createMockMember(
      testId,
      testVoiceId,
      testUserName,
      testNickname
    ).object;

    const memberImpl = new DiscordMemberImpl(mockMember);

    expect(memberImpl.id).toEqual(testId);
    expect(memberImpl.voiceChannelId).toEqual(testVoiceId);
  });

  test("should get nickname as display name if it exists", () => {
    const mockMember = createMockMember(
      testId,
      testVoiceId,
      testUserName,
      testNickname
    ).object;

    const memberImpl = new DiscordMemberImpl(mockMember);

    expect(memberImpl.getDisplayName()).toEqual(testNickname);
  });

  function createMockMember(
    id: string,
    voiceId: string,
    username: string,
    nickname: string
  ): TypeMoq.IMock<GuildMember> {
    const mock = TypeMoq.Mock.ofType<GuildMember>();
    const mockUser = TypeMoq.Mock.ofType<User>();
    mockUser.setup(u => u.username).returns(() => username);
    mock.setup(m => m.user).returns(() => mockUser.object);
    mock.setup(m => m.id).returns(() => id);
    mock.setup(m => m.nickname).returns(() => nickname);
    mock.setup(m => m.voiceChannelID).returns(() => voiceId);
    return mock;
  }
});
