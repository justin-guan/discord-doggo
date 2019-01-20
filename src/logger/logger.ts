import path from "path";
import * as winston from "winston";

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      level: "info",
      filename: path.join(__dirname, "logs.log"),
      handleExceptions: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(i => `${i.level} ${i.timestamp}: ${i.message}`)
      )
    }),
    new winston.transports.Console({
      level: "debug",
      handleExceptions: true,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(i => `${i.level} ${i.timestamp}: ${i.message}`)
      )
    })
  ],
  exitOnError: false
});

export = logger;
