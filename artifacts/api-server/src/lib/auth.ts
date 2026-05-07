import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { db, appUsersTable, type AppUser } from "@workspace/db";
import { eq } from "drizzle-orm";

export type AuthenticatedUser = Pick<
  AppUser,
  | "id"
  | "email"
  | "displayName"
  | "role"
  | "plan"
  | "status"
  | "generationsUsed"
  | "projectsCreated"
  | "isEmailVerified"
>;

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function authSecret(): string {
  return process.env["SESSION_SECRET"] ?? "matrice-secret";
}

function base64url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function signPayload(payload: string): string {
  return createHmac("sha256", authSecret()).update(payload).digest("base64url");
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function createAuthActionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return expected.length === candidate.length && timingSafeEqual(expected, candidate);
}

export function createUserToken(user: Pick<AppUser, "id">): string {
  const payload = JSON.stringify({ sub: user.id, exp: Date.now() + TOKEN_TTL_MS });
  const encoded = base64url(payload);
  return `${encoded}.${signPayload(encoded)}`;
}

function readBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
}

async function resolveUserFromToken(token: string | null): Promise<AuthenticatedUser | null> {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature || signPayload(encoded) !== signature) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as { sub?: string; exp?: number };
    if (!payload.sub || !payload.exp || payload.exp < Date.now()) return null;
    const [user] = await db.select().from(appUsersTable).where(eq(appUsersTable.id, payload.sub)).limit(1);
    if (!user || user.status !== "active") return null;
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      plan: user.plan,
      status: user.status,
      generationsUsed: user.generationsUsed,
      projectsCreated: user.projectsCreated,
      isEmailVerified: user.isEmailVerified,
    };
  } catch {
    return null;
  }
}

export function getAuthUser(req: Request): AuthenticatedUser | null {
  return (req as Request & { authUser?: AuthenticatedUser | null }).authUser ?? null;
}

export async function authContextMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  void res;
  const user = await resolveUserFromToken(readBearerToken(req));
  (req as Request & { authUser?: AuthenticatedUser | null }).authUser = user;
  next();
}
