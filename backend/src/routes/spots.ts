import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import {
  createSpot,
  listSpotsForUser,
  findSpotForUser,
  updateSpotForUser,
  deleteSpotForUser,
} from "../db/spots";

export const spotsRouter = Router();

spotsRouter.use(requireAuth);

function isValidLat(lat: unknown): lat is number {
  return typeof lat === "number" && lat >= -90 && lat <= 90;
}

function isValidLon(lon: unknown): lon is number {
  return typeof lon === "number" && lon >= -180 && lon <= 180;
}

spotsRouter.post("/spots", async (req: Request, res: Response) => {
  const { label, lat, lon, notes, is_private } = req.body ?? {};

  if (typeof label !== "string" || label.trim().length === 0) {
    return res.status(400).json({ error: "label is required" });
  }
  if (!isValidLat(lat) || !isValidLon(lon)) {
    return res.status(400).json({ error: "lat/lon must be valid numbers in range" });
  }

  const spot = await createSpot(
    req.userId!,
    label,
    lat,
    lon,
    typeof notes === "string" ? notes : null,
    typeof is_private === "boolean" ? is_private : true
  );

  res.status(201).json(spot);
});

spotsRouter.get("/spots", async (req: Request, res: Response) => {
  const spots = await listSpotsForUser(req.userId!);
  res.json(spots);
});

spotsRouter.get("/spots/:id", async (req: Request, res: Response) => {
  const spot = await findSpotForUser(req.params.id, req.userId!);
  if (!spot) {
    return res.status(404).json({ error: "Spot not found" });
  }
  res.json(spot);
});

spotsRouter.patch("/spots/:id", async (req: Request, res: Response) => {
  const { label, lat, lon, notes, is_private } = req.body ?? {};
  const updates: Record<string, unknown> = {};

  if (label !== undefined) {
    if (typeof label !== "string" || label.trim().length === 0) {
      return res.status(400).json({ error: "label must be a non-empty string" });
    }
    updates.label = label;
  }
  if (lat !== undefined) {
    if (!isValidLat(lat)) {
      return res.status(400).json({ error: "lat must be a valid number in range" });
    }
    updates.lat = lat;
  }
  if (lon !== undefined) {
    if (!isValidLon(lon)) {
      return res.status(400).json({ error: "lon must be a valid number in range" });
    }
    updates.lon = lon;
  }
  if (notes !== undefined) {
    updates.notes = typeof notes === "string" ? notes : null;
  }
  if (is_private !== undefined) {
    updates.is_private = Boolean(is_private);
  }

  const spot = await updateSpotForUser(req.params.id, req.userId!, updates);
  if (!spot) {
    return res.status(404).json({ error: "Spot not found" });
  }
  res.json(spot);
});

spotsRouter.delete("/spots/:id", async (req: Request, res: Response) => {
  const deleted = await deleteSpotForUser(req.params.id, req.userId!);
  if (!deleted) {
    return res.status(404).json({ error: "Spot not found" });
  }
  res.status(204).send();
});
