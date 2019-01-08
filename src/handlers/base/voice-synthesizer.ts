import { voiceUrl } from "@config";
import fs from "fs";
import request from "request";

export default class VoiceSynthesizer {
  public async synthesize(text: string, path: string): Promise<void> {
    fs.exists(path, async exists => {
      if (exists) {
        await this.synthesizeRequest(text, path);
      } else {
        return Promise.reject("Path does not exist");
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
