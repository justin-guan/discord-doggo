import { voiceUrl } from "@config";
import fs from "fs";
import request from "request";

export default class VoiceSynthesizer {
  public synthesize(text: string, path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.exists(path, exists => {
        if (exists) {
          resolve(path);
        } else {
          const writable = fs.createWriteStream(path);
          writable.on("error", err => reject(err));
          writable.on("finish", () => resolve(path));
          request.get(voiceUrl + text).pipe(writable);
        }
      });
    });
  }
}
