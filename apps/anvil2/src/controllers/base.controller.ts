import { Request, Response, NextFunction } from "express";

export class BaseController {
  protected sendResponse(res: Response, data: any, statusCode = 200) {
    res.status(statusCode).json(data);
  }

  protected sendError(res: Response, error: any, statusCode = 500) {
    res.status(statusCode).json({ error: error.message || "Internal Server Error" });
  }
}
