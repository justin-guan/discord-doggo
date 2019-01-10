import { voiceUrl } from "@config";
import fs, { promises } from "fs";
import request from "request";

export default class VoiceSynthesizer {
  public synthesize(text: string, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.exists(path, exists => {
        if (exists) {
          resolve();
        } else {
          const writable = fs.createWriteStream(path);
          writable.on("error", err => reject(err));
          writable.on("finish", () => resolve());
          request.get(voiceUrl + text).pipe(writable);
        }
      });
    });
  }
}
