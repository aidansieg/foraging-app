import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { listSpecies } from "../db/species";
import { asyncHandler } from "../utils/asyncHandler";

export const speciesRouter = Router();

speciesRouter.use(requireAuth);

speciesRouter.get(
  "/species",
  asyncHandler(async (_req: Request, res: Response) => {
    const species = await listSpecies();
    res.json(species);
  })
);
