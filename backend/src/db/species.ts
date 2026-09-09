import { pool } from "./pool";

export interface SpeciesRow {
  id: string;
  common_name: string;
  latin_name: string;
  season_start_month: number;
  season_end_month: number;
  substrate_type: string;
  baseline_trigger_rules: Record<string, unknown>;
  created_at: Date;
}

export async function listSpecies(): Promise<SpeciesRow[]> {
  const result = await pool.query<SpeciesRow>(
    "SELECT * FROM species ORDER BY common_name"
  );
  return result.rows;
}

export async function findSpeciesById(id: string): Promise<SpeciesRow | null> {
  const result = await pool.query<SpeciesRow>(
    "SELECT * FROM species WHERE id = $1",
    [id]
  );
  return result.rows[0] ?? null;
}
