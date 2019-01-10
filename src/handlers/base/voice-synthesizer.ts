import { voiceUrl } from "@config";
import fs, { promises } from "fs";
import request from "request";

export default class VoiceSynthesizer {
  public async synthesize(text: string, path: string): Promise<void> {
    fs.exists(path, async exists => {
      if (exists) {
        return Promise.resolve();
      } else {
        await this.synthesizeRequest(text, path);
      }
    });
  }

  private async synthesizeRequest(text: string, path: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const writable = fs.createWriteStream(path);
      writable.on("error", err => reject(err));
      writable.on("finish", () => resolve());
      request.get(voiceUrl + text).pipe(writable);
    });
  }
}
