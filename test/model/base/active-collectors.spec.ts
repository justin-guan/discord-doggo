import ActiveCollectors from "@model/base/active-collectors";

describe("Active Collectors", () => {
  const testUserId = "test";

  beforeEach(() => {
    ActiveCollectors.getInstance().removeActiveCollector(testUserId);
  });

  test("should only have one global singleton instance of active collectors", () => {
    expect(ActiveCollectors.getInstance()).toBe(ActiveCollectors.getInstance());
  });

  test("should add an active collector", () => {
    const activeCollectors = ActiveCollectors.getInstance();

    activeCollectors.addNewActiveCollector(testUserId);

    expect(activeCollectors.hasActiveCollector(testUserId)).toEqual(true);
  });

  test("should fail to add an active collector that already exists", () => {
    const activeCollectors = ActiveCollectors.getInstance();

    activeCollectors.addNewActiveCollector(testUserId);

    expect(() => activeCollectors.addNewActiveCollector(testUserId)).toThrow();
  });

  test("should remove an active collector", () => {
    const activeCollectors = ActiveCollectors.getInstance();

    activeCollectors.addNewActiveCollector(testUserId);
    activeCollectors.removeActiveCollector(testUserId);

    expect(activeCollectors.hasActiveCollector(testUserId)).toEqual(false);
  });
});
