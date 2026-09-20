import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("Unhandled error:", err);

  if (res.headersSent) {
    return;
  }

  res.status(500).json({ error: "Something went wrong on our end" });
}
