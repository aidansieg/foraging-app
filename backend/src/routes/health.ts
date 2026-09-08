import { Router, Request, Response } from "express";
import { pool } from "../db/pool";

export const healthRouter = Router();

healthRouter.get("/health", async (_req: Request, res: Response) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    console.error("Health check DB failure:", err);
    res.status(503).json({ status: "error", db: "unreachable" });
  }
});
