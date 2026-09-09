import { pool } from "./pool";

export interface SpotRow {
  id: string;
  user_id: string;
  label: string;
  lat: number;
  lon: number;
  notes: string | null;
  is_private: boolean;
  created_at: Date;
}

export async function createSpot(
  userId: string,
  label: string,
  lat: number,
  lon: number,
  notes: string | null,
  isPrivate: boolean
): Promise<SpotRow> {
  const result = await pool.query<SpotRow>(
    `INSERT INTO spots (user_id, label, lat, lon, notes, is_private)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, label, lat, lon, notes, isPrivate]
  );
  return result.rows[0];
}

export async function listSpotsForUser(userId: string): Promise<SpotRow[]> {
  const result = await pool.query<SpotRow>(
    "SELECT * FROM spots WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return result.rows;
}

export async function findSpotForUser(
  spotId: string,
  userId: string
): Promise<SpotRow | null> {
  const result = await pool.query<SpotRow>(
    "SELECT * FROM spots WHERE id = $1 AND user_id = $2",
    [spotId, userId]
  );
  return result.rows[0] ?? null;
}

interface SpotUpdate {
  label?: string;
  lat?: number;
  lon?: number;
  notes?: string | null;
  is_private?: boolean;
}

export async function updateSpotForUser(
  spotId: string,
  userId: string,
  updates: SpotUpdate
): Promise<SpotRow | null> {
  const fields = Object.keys(updates) as (keyof SpotUpdate)[];
  if (fields.length === 0) {
    return findSpotForUser(spotId, userId);
  }

  const setClauses = fields.map((field, i) => `${field} = $${i + 1}`);
  const values = fields.map((field) => updates[field]);

  const result = await pool.query<SpotRow>(
    `UPDATE spots
     SET ${setClauses.join(", ")}
     WHERE id = $${fields.length + 1} AND user_id = $${fields.length + 2}
     RETURNING *`,
    [...values, spotId, userId]
  );
  return result.rows[0] ?? null;
}

export async function deleteSpotForUser(
  spotId: string,
  userId: string
): Promise<boolean> {
  const result = await pool.query(
    "DELETE FROM spots WHERE id = $1 AND user_id = $2",
    [spotId, userId]
  );
  return (result.rowCount ?? 0) > 0;
}
