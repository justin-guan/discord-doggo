import { voiceUrl } from "@config";
import logger = require("@logger");
import fs from "fs";
import request from "request";

const RESPONSE_OK_CODE = 200;

export default class VoiceSynthesizer {
  public synthesize(text: string, path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.exists(path, exists => {
        if (exists) {
          resolve(path);
        } else {
          const writable = fs.createWriteStream(path);
          let streamEndByError = false;
          writable.on("error", err => reject(err));
          writable.on("finish", () => {
            if (!streamEndByError) {
              resolve(path);
            }
          });
          const r = request.get(voiceUrl + text);
          r.on("response", async response => {
            if (response.statusCode !== RESPONSE_OK_CODE) {
              streamEndByError = true;
              r.abort();
              writable.end(async () => {
                try {
                  await this.deleteFile(path);
                } catch (e) {
                  logger.error(`Failed to delete file at ${path}\n${e}`);
                } finally {
                  reject(new Error("Failed to download voice file"));
                }
              });
            } else {
              r.pipe(writable);
            }
          });
        }
      });
    });
  }

  private deleteFile(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.unlink(path, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
