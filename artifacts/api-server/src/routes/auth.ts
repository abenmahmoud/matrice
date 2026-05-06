import { Router, type IRouter } from "express";
import { db, appUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createUserToken, getAuthUser, hashPassword, verifyPassword } from "../lib/auth.js";

const router: IRouter = Router();

function publicUser(user: typeof appUsersTable.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    plan: user.plan,
    status: user.status,
    generationsUsed: user.generationsUsed,
    projectsCreated: user.projectsCreated,
  };
}

router.post("/auth/signup", async (req, res) => {
  try {
    const { email, password, displayName } = req.body as { email?: string; password?: string; displayName?: string };
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !password || password.length < 8) {
      res.status(400).json({ error: "EMAIL_AND_PASSWORD_REQUIRED" });
      return;
    }

    const existing = await db.select({ id: appUsersTable.id }).from(appUsersTable).where(eq(appUsersTable.email, normalizedEmail)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
      return;
    }

    const [user] = await db
      .insert(appUsersTable)
      .values({
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        displayName: displayName?.trim() ?? "",
        plan: "free",
        role: "user",
      })
      .returning();

    res.status(201).json({ user: publicUser(user), token: createUserToken(user) });
  } catch (err) {
    req.log.error({ err }, "Failed to sign up user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      res.status(400).json({ error: "EMAIL_AND_PASSWORD_REQUIRED" });
      return;
    }

    const [user] = await db.select().from(appUsersTable).where(eq(appUsersTable.email, normalizedEmail)).limit(1);
    if (!user || !verifyPassword(password, user.passwordHash) || user.status !== "active") {
      res.status(401).json({ error: "INVALID_CREDENTIALS" });
      return;
    }

    res.json({ user: publicUser(user), token: createUserToken(user) });
  } catch (err) {
    req.log.error({ err }, "Failed to log in user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "AUTH_REQUIRED" });
    return;
  }
  res.json({ user });
});

export default router;
