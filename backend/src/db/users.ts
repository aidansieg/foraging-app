import { pool } from "./pool";

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  plan: "free" | "premium";
  stripe_customer_id: string | null;
  created_at: Date;
}

export interface PublicUser {
  id: string;
  email: string;
  plan: "free" | "premium";
}

function toPublicUser(row: UserRow): PublicUser {
  return { id: row.id, email: row.email, plan: row.plan };
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] ?? null;
}

export async function createUser(
  email: string,
  passwordHash: string
): Promise<PublicUser> {
  const result = await pool.query<UserRow>(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING *`,
    [email, passwordHash]
  );
  return toPublicUser(result.rows[0]);
}

export { toPublicUser };
