import winston from "winston";
import path from "node:path";
import { getEnvVariable } from "@/utils/config";

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
];

const Logger = winston.createLogger({
  level: logLevel,
  levels,
  format,
  transports,
});

export default Logger;
