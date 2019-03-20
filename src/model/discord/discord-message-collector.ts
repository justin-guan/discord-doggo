import MessageCollector from "@model/base/message-collector";
import { MessageCollector as Collector } from "discord.js";

export default class DiscordMessageCollector implements MessageCollector {
  private collector: Collector;

  constructor(collector: Collector) {
    this.collector = collector;
  }

  public destroy(): void {
    this.collector.stop();
  }
}
