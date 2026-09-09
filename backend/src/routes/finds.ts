import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { findSpotForUser } from "../db/spots";
import { findSpeciesById } from "../db/species";
import {
  createFind,
  listFindsForUser,
  findFindForUser,
  updateFindForUser,
  deleteFindForUser,
} from "../db/finds";

export const findsRouter = Router();

findsRouter.use(requireAuth);

function isValidDateString(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

findsRouter.post("/finds", async (req: Request, res: Response) => {
  const { spot_id, species_id, date_found, yield_estimate, photo_url, notes } =
    req.body ?? {};

  if (typeof spot_id !== "string" || typeof species_id !== "string") {
    return res.status(400).json({ error: "spot_id and species_id are required" });
  }
  if (!isValidDateString(date_found)) {
    return res.status(400).json({ error: "date_found must be in YYYY-MM-DD format" });
  }
  if (
    yield_estimate !== undefined &&
    yield_estimate !== null &&
    typeof yield_estimate !== "number"
  ) {
    return res.status(400).json({ error: "yield_estimate must be a number" });
  }

  const spot = await findSpotForUser(spot_id, req.userId!);
  if (!spot) {
    return res.status(404).json({ error: "Spot not found" });
  }

  const species = await findSpeciesById(species_id);
  if (!species) {
    return res.status(400).json({ error: "species_id does not match a known species" });
  }

  const find = await createFind(
    req.userId!,
    spot_id,
    species_id,
    date_found,
    typeof yield_estimate === "number" ? yield_estimate : null,
    typeof photo_url === "string" ? photo_url : null,
    typeof notes === "string" ? notes : null
  );

  res.status(201).json(find);
});

findsRouter.get("/finds", async (req: Request, res: Response) => {
  const finds = await listFindsForUser(req.userId!);
  res.json(finds);
});

findsRouter.get("/finds/:id", async (req: Request, res: Response) => {
  const find = await findFindForUser(req.params.id, req.userId!);
  if (!find) {
    return res.status(404).json({ error: "Find not found" });
  }
  res.json(find);
});

findsRouter.patch("/finds/:id", async (req: Request, res: Response) => {
  const { spot_id, species_id, date_found, yield_estimate, photo_url, notes } =
    req.body ?? {};
  const updates: Record<string, unknown> = {};

  if (spot_id !== undefined) {
    if (typeof spot_id !== "string") {
      return res.status(400).json({ error: "spot_id must be a string" });
    }
    const spot = await findSpotForUser(spot_id, req.userId!);
    if (!spot) {
      return res.status(404).json({ error: "Spot not found" });
    }
    updates.spot_id = spot_id;
  }
  if (species_id !== undefined) {
    if (typeof species_id !== "string") {
      return res.status(400).json({ error: "species_id must be a string" });
    }
    const species = await findSpeciesById(species_id);
    if (!species) {
      return res.status(400).json({ error: "species_id does not match a known species" });
    }
    updates.species_id = species_id;
  }
  if (date_found !== undefined) {
    if (!isValidDateString(date_found)) {
      return res.status(400).json({ error: "date_found must be in YYYY-MM-DD format" });
    }
    updates.date_found = date_found;
  }
  if (yield_estimate !== undefined) {
    if (yield_estimate !== null && typeof yield_estimate !== "number") {
      return res.status(400).json({ error: "yield_estimate must be a number or null" });
    }
    updates.yield_estimate = yield_estimate;
  }
  if (photo_url !== undefined) {
    updates.photo_url = typeof photo_url === "string" ? photo_url : null;
  }
  if (notes !== undefined) {
    updates.notes = typeof notes === "string" ? notes : null;
  }

  const find = await updateFindForUser(req.params.id, req.userId!, updates);
  if (!find) {
    return res.status(404).json({ error: "Find not found" });
  }
  res.json(find);
});

findsRouter.delete("/finds/:id", async (req: Request, res: Response) => {
  const deleted = await deleteFindForUser(req.params.id, req.userId!);
  if (!deleted) {
    return res.status(404).json({ error: "Find not found" });
  }
  res.status(204).send();
});
