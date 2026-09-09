import { pool } from "./pool";

export interface FindRow {
  id: string;
  user_id: string;
  spot_id: string;
  species_id: string;
  date_found: string;
  yield_estimate: number | null;
  photo_url: string | null;
  notes: string | null;
  weather_snapshot: Record<string, unknown> | null;
  created_at: Date;
}

export async function createFind(
  userId: string,
  spotId: string,
  speciesId: string,
  dateFound: string,
  yieldEstimate: number | null,
  photoUrl: string | null,
  notes: string | null
): Promise<FindRow> {
  const result = await pool.query<FindRow>(
    `INSERT INTO finds (user_id, spot_id, species_id, date_found, yield_estimate, photo_url, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userId, spotId, speciesId, dateFound, yieldEstimate, photoUrl, notes]
  );
  return result.rows[0];
}

export async function listFindsForUser(userId: string): Promise<FindRow[]> {
  const result = await pool.query<FindRow>(
    "SELECT * FROM finds WHERE user_id = $1 ORDER BY date_found DESC",
    [userId]
  );
  return result.rows;
}

export async function findFindForUser(
  findId: string,
  userId: string
): Promise<FindRow | null> {
  const result = await pool.query<FindRow>(
    "SELECT * FROM finds WHERE id = $1 AND user_id = $2",
    [findId, userId]
  );
  return result.rows[0] ?? null;
}

interface FindUpdate {
  spot_id?: string;
  species_id?: string;
  date_found?: string;
  yield_estimate?: number | null;
  photo_url?: string | null;
  notes?: string | null;
}

export async function updateFindForUser(
  findId: string,
  userId: string,
  updates: FindUpdate
): Promise<FindRow | null> {
  const fields = Object.keys(updates) as (keyof FindUpdate)[];
  if (fields.length === 0) {
    return findFindForUser(findId, userId);
  }

  const setClauses = fields.map((field, i) => `${field} = $${i + 1}`);
  const values = fields.map((field) => updates[field]);

  const result = await pool.query<FindRow>(
    `UPDATE finds
     SET ${setClauses.join(", ")}
     WHERE id = $${fields.length + 1} AND user_id = $${fields.length + 2}
     RETURNING *`,
    [...values, findId, userId]
  );
  return result.rows[0] ?? null;
}

export async function deleteFindForUser(
  findId: string,
  userId: string
): Promise<boolean> {
  const result = await pool.query(
    "DELETE FROM finds WHERE id = $1 AND user_id = $2",
    [findId, userId]
  );
  return (result.rowCount ?? 0) > 0;
}
