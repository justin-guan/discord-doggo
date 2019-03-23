import Attachment from "@model/base/attachment";
import { MessageAttachment } from "discord.js";

export default class DiscordAttachment implements Attachment {
  private attachment: MessageAttachment;

  constructor(attachment: MessageAttachment) {
    this.attachment = attachment;
  }

  public get url(): string {
    return this.attachment.url;
  }
}
