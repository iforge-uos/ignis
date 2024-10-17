import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "node:path";
import { getEnvVariable } from "@/utils/config.utils";

const logDir = "logs";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
);

const logLevel = getEnvVariable("LOG_LEVEL", "info");

const transports = [
  new winston.transports.Console(),
  new DailyRotateFile({
    filename: path.join(logDir, "application-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    level: logLevel,
  }),
  new DailyRotateFile({
    filename: path.join(logDir, "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    level: "error",
  }),
];

const Logger = winston.createLogger({
  level: logLevel,
  levels,
  format,
  transports,
});

export default Logger;
