import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { createUser, findUserByEmail, toPublicUser } from "../db/users";

export const authRouter = Router();

const BCRYPT_ROUNDS = 12;
const TOKEN_EXPIRY = "7d";

function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function signToken(userId: string): string {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: TOKEN_EXPIRY });
}

authRouter.post("/auth/register", async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "A valid email is required" });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await createUser(email, passwordHash);
  const token = signToken(user.id);

  res.status(201).json({ token, user });
});

authRouter.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const userRow = await findUserByEmail(email);

  const invalidCredentialsResponse = () =>
    res.status(401).json({ error: "Invalid email or password" });

  if (!userRow) {
    return invalidCredentialsResponse();
  }

  const passwordMatches = await bcrypt.compare(password, userRow.password_hash);
  if (!passwordMatches) {
    return invalidCredentialsResponse();
  }

  const token = signToken(userRow.id);
  res.json({ token, user: toPublicUser(userRow) });
});
