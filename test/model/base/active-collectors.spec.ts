import ActiveCollectors from "@model/base/active-collectors";

describe("Active Collectors", () => {
  const testChannelId = "test";

  beforeEach(() => {
    ActiveCollectors.getInstance().removeActiveCollector(testChannelId);
  });

  test("should only have one global singleton instance of active collectors", () => {
    expect(ActiveCollectors.getInstance()).toBe(ActiveCollectors.getInstance());
  });

  test("should add an active collector", () => {
    const activeCollectors = ActiveCollectors.getInstance();

    activeCollectors.addNewActiveCollector(testChannelId);

    expect(activeCollectors.hasActiveCollector(testChannelId)).toEqual(true);
  });

  test("should fail to add an active collector that already exists", () => {
    const activeCollectors = ActiveCollectors.getInstance();

    activeCollectors.addNewActiveCollector(testChannelId);

    expect(() =>
      activeCollectors.addNewActiveCollector(testChannelId)
    ).toThrow();
  });

  test("should remove an active collector", () => {
    const activeCollectors = ActiveCollectors.getInstance();

    activeCollectors.addNewActiveCollector(testChannelId);
    activeCollectors.removeActiveCollector(testChannelId);

    expect(activeCollectors.hasActiveCollector(testChannelId)).toEqual(false);
  });
});
