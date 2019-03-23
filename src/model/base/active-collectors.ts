export default class ActiveCollectors {
  public static getInstance(): ActiveCollectors {
    if (!ActiveCollectors.instance) {
      ActiveCollectors.instance = new ActiveCollectors();
    }
    return ActiveCollectors.instance;
  }

  private static instance: ActiveCollectors;
  private activeCollectorChannelIds = new Map<string, void>();

  private constructor() {}

  public hasActiveCollector(userId: string): boolean {
    return this.activeCollectorChannelIds.has(userId);
  }

  public addNewActiveCollector(userId: string): void {
    if (this.hasActiveCollector(userId)) {
      throw new Error(
        `An active collector is already running for user ${userId}`
      );
    }
    this.activeCollectorChannelIds.set(userId, undefined);
  }

  public removeActiveCollector(userId: string): void {
    this.activeCollectorChannelIds.delete(userId);
  }
}
