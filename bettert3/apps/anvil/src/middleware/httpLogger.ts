import { Request, Response, NextFunction } from "express";
import Logger from "@/utils/logger";

export function httpLogger(req: Request, res: Response, next: NextFunction) {
  const { method, url } = req;
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    Logger.http(`${method} ${url} ${statusCode} - ${duration}ms`);
  });

  next();
}
