import { Router, type IRouter } from "express";
import { db, appUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createAuthActionToken, createUserToken, getAuthUser, hashPassword, verifyPassword } from "../lib/auth.js";
import { sendVerificationEmail } from "../services/emailService.js";

const router: IRouter = Router();
const VERIFICATION_RESEND_COOLDOWN_MS = 1000 * 60;

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
    isEmailVerified: user.isEmailVerified,
    onboardingCompletedAt: user.onboardingCompletedAt,
  };
}

async function sendUserVerificationEmail(user: typeof appUsersTable.$inferSelect) {
  if (!user.emailVerificationToken) {
    return { status: "failed" as const, message: "MISSING_VERIFICATION_TOKEN" };
  }
  return sendVerificationEmail({
    to: user.email,
    displayName: user.displayName,
    token: user.emailVerificationToken,
  });
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
        isEmailVerified: false,
        emailVerificationToken: createAuthActionToken(),
        emailVerificationSentAt: new Date(),
      })
      .returning();

    const emailDelivery = await sendUserVerificationEmail(user);
    if (emailDelivery.status === "failed") {
      req.log.warn({ emailDelivery }, "Verification email delivery failed");
    }

    res.status(201).json({
      user: publicUser(user),
      emailVerificationRequired: true,
      emailDelivery,
    });
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

    if (!user.isEmailVerified) {
      res.status(403).json({ error: "EMAIL_NOT_VERIFIED", user: publicUser(user), canResend: true });
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

router.get("/auth/verify-email", async (req, res) => {
  try {
    const token = typeof req.query.token === "string" ? req.query.token : "";
    if (!token) {
      res.status(400).json({ error: "TOKEN_REQUIRED" });
      return;
    }

    const [user] = await db.select().from(appUsersTable).where(eq(appUsersTable.emailVerificationToken, token)).limit(1);
    if (!user || user.status !== "active") {
      res.status(400).json({ error: "INVALID_OR_EXPIRED_TOKEN" });
      return;
    }

    const [updatedUser] = await db
      .update(appUsersTable)
      .set({
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationSentAt: null,
        updatedAt: new Date(),
      })
      .where(eq(appUsersTable.id, user.id))
      .returning();

    res.json({ user: publicUser(updatedUser), token: createUserToken(updatedUser) });
  } catch (err) {
    req.log.error({ err }, "Failed to verify email");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/resend-verification", async (req, res) => {
  try {
    const { email } = req.body as { email?: string };
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail) {
      res.status(400).json({ error: "EMAIL_REQUIRED" });
      return;
    }

    const [user] = await db.select().from(appUsersTable).where(eq(appUsersTable.email, normalizedEmail)).limit(1);
    if (!user || user.status !== "active") {
      res.status(200).json({ ok: true });
      return;
    }

    if (user.isEmailVerified) {
      res.status(409).json({ error: "EMAIL_ALREADY_VERIFIED" });
      return;
    }

    if (
      user.emailVerificationSentAt &&
      Date.now() - new Date(user.emailVerificationSentAt).getTime() < VERIFICATION_RESEND_COOLDOWN_MS
    ) {
      res.status(429).json({ error: "VERIFICATION_EMAIL_RECENTLY_SENT" });
      return;
    }

    const [updatedUser] = await db
      .update(appUsersTable)
      .set({
        emailVerificationToken: createAuthActionToken(),
        emailVerificationSentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(appUsersTable.id, user.id))
      .returning();

    const emailDelivery = await sendUserVerificationEmail(updatedUser);
    if (emailDelivery.status === "failed") {
      req.log.warn({ emailDelivery }, "Verification email resend failed");
    }

    res.json({ ok: true, emailDelivery });
  } catch (err) {
    req.log.error({ err }, "Failed to resend verification email");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
