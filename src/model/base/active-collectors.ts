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

  public hasActiveCollector(channelId: string): boolean {
    return this.activeCollectorChannelIds.has(channelId);
  }

  public addNewActiveCollector(channelId: string): void {
    if (this.hasActiveCollector(channelId)) {
      throw new Error(
        `An active collector is already running for user ${channelId}`
      );
    }
    this.activeCollectorChannelIds.set(channelId, undefined);
  }

  public removeActiveCollector(channelId: string): void {
    this.activeCollectorChannelIds.delete(channelId);
  }
}
