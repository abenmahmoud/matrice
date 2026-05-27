import { Router, type IRouter } from "express";
import { betaCodeUsagesTable, betaInviteCodesTable, db, appUsersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { createAuthActionToken, createUserToken, getAuthUser, hashPassword, verifyPassword } from "../lib/auth.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../services/emailService.js";
import { normalizeInviteCode, validateInviteCodeState } from "../services/betaInviteService.js";
import { welcomeEmail } from "../services/emailTemplates.js";
import { notify } from "../services/notificationService.js";
import { ensureWelcomeStep } from "../services/onboardingService.js";

const router: IRouter = Router();
const VERIFICATION_RESEND_COOLDOWN_MS = 1000 * 60;
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 60;

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
    creatorModeEnabled: user.creatorModeEnabled,
    isBetaTester: user.isBetaTester,
    betaStartedAt: user.betaStartedAt,
    betaExpiresAt: user.betaExpiresAt,
    onboardingStep: user.onboardingStep,
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
    const { email, password, displayName, inviteCode, invite_code } = req.body as {
      email?: string;
      password?: string;
      displayName?: string;
      inviteCode?: string;
      invite_code?: string;
    };
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !password || password.length < 8) {
      res.status(400).json({ error: "EMAIL_AND_PASSWORD_REQUIRED" });
      return;
    }

    const normalizedInviteCode = normalizeInviteCode(inviteCode ?? invite_code);
    const [betaCode] = normalizedInviteCode
      ? await db.select().from(betaInviteCodesTable).where(eq(betaInviteCodesTable.code, normalizedInviteCode)).limit(1)
      : [];
    const inviteValidation = normalizedInviteCode ? validateInviteCodeState(betaCode) : { ok: true as const };
    if (!inviteValidation.ok) {
      res.status(inviteValidation.status).json({ error: inviteValidation.error });
      return;
    }

    const betaStartedAt = betaCode ? new Date() : null;
    const betaExpiresAt = betaCode && betaStartedAt
      ? new Date(betaStartedAt.getTime() + betaCode.durationMonths * 30 * 24 * 60 * 60 * 1000)
      : null;

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
        plan: betaCode?.planGranted ?? "free",
        role: "user",
        isBetaTester: Boolean(betaCode),
        betaStartedAt,
        betaExpiresAt,
        isEmailVerified: false,
        emailVerificationToken: createAuthActionToken(),
        emailVerificationSentAt: new Date(),
      })
      .returning();

    if (betaCode) {
      await db
        .update(betaInviteCodesTable)
        .set({ usesCount: sql`${betaInviteCodesTable.usesCount} + 1` })
        .where(eq(betaInviteCodesTable.code, betaCode.code));
      await db.insert(betaCodeUsagesTable).values({
        code: betaCode.code,
        userId: user.id,
        ipAddress: req.ip ?? null,
        userAgent: req.get("user-agent") ?? null,
      });
    }

    await ensureWelcomeStep(user.id);
    void notify({
      userId: user.id,
      type: betaCode ? "beta_welcome" : "welcome",
      title: betaCode ? "Bienvenue dans la beta Matrice" : "Bienvenue sur Matrice",
      body: betaCode ? "Ton acces beta Premium est active. On commence par ton premier projet." : "On commence par ton premier projet.",
      actionUrl: "/onboarding",
      actionLabel: "Demarrer",
      email: welcomeEmail({ displayName: user.displayName || user.email, betaExpiresAt }),
    }).catch((err) => req.log.warn({ err }, "Welcome notification failed"));

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

router.patch("/auth/me", async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: "AUTH_REQUIRED" });
      return;
    }

    const { displayName } = req.body as { displayName?: string };
    if (typeof displayName !== "string" || displayName.trim().length < 1 || displayName.trim().length > 80) {
      res.status(400).json({ error: "DISPLAY_NAME_INVALID" });
      return;
    }

    const [user] = await db
      .update(appUsersTable)
      .set({ displayName: displayName.trim(), updatedAt: new Date() })
      .where(eq(appUsersTable.id, authUser.id))
      .returning();

    res.json({ user: publicUser(user), token: createUserToken(user) });
  } catch (err) {
    req.log.error({ err }, "Failed to update user profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/change-password", async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: "AUTH_REQUIRED" });
      return;
    }

    const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      res.status(400).json({ error: "PASSWORD_REQUIRED" });
      return;
    }

    const [user] = await db.select().from(appUsersTable).where(eq(appUsersTable.id, authUser.id)).limit(1);
    if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
      res.status(401).json({ error: "INVALID_CURRENT_PASSWORD" });
      return;
    }

    const [updatedUser] = await db
      .update(appUsersTable)
      .set({ passwordHash: hashPassword(newPassword), updatedAt: new Date() })
      .where(eq(appUsersTable.id, authUser.id))
      .returning();

    res.json({ user: publicUser(updatedUser), token: createUserToken(updatedUser) });
  } catch (err) {
    req.log.error({ err }, "Failed to change password");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.json({ ok: true });
});

router.delete("/auth/me", async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: "AUTH_REQUIRED" });
      return;
    }

    await db
      .update(appUsersTable)
      .set({ status: "deleted", updatedAt: new Date() })
      .where(eq(appUsersTable.id, authUser.id));

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete user account");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/onboarding/complete", async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: "AUTH_REQUIRED" });
      return;
    }

    const [user] = await db
      .update(appUsersTable)
      .set({ onboardingCompletedAt: new Date(), updatedAt: new Date() })
      .where(eq(appUsersTable.id, authUser.id))
      .returning();

    res.json({ user: publicUser(user) });
  } catch (err) {
    req.log.error({ err }, "Failed to complete onboarding");
    res.status(500).json({ error: "Internal server error" });
  }
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

router.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body as { email?: string };
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail) {
      res.status(400).json({ error: "EMAIL_REQUIRED" });
      return;
    }

    const [user] = await db.select().from(appUsersTable).where(eq(appUsersTable.email, normalizedEmail)).limit(1);
    if (!user || user.status !== "active") {
      res.json({ ok: true });
      return;
    }

    const [updatedUser] = await db
      .update(appUsersTable)
      .set({
        passwordResetToken: createAuthActionToken(),
        passwordResetExpiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
        updatedAt: new Date(),
      })
      .where(eq(appUsersTable.id, user.id))
      .returning();

    if (!updatedUser.passwordResetToken) {
      res.status(500).json({ error: "RESET_TOKEN_NOT_CREATED" });
      return;
    }

    const emailDelivery = await sendPasswordResetEmail({
      to: updatedUser.email,
      displayName: updatedUser.displayName,
      token: updatedUser.passwordResetToken,
    });

    if (emailDelivery.status === "failed") {
      req.log.warn({ emailDelivery }, "Password reset email delivery failed");
    }

    res.json({ ok: true, emailDelivery });
  } catch (err) {
    req.log.error({ err }, "Failed to request password reset");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body as { token?: string; password?: string };
    if (!token || !password || password.length < 8) {
      res.status(400).json({ error: "TOKEN_AND_PASSWORD_REQUIRED" });
      return;
    }

    const [user] = await db
      .select()
      .from(appUsersTable)
      .where(eq(appUsersTable.passwordResetToken, token))
      .limit(1);

    if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt <= new Date()) {
      res.status(400).json({ error: "INVALID_OR_EXPIRED_TOKEN" });
      return;
    }

    const [updatedUser] = await db
      .update(appUsersTable)
      .set({
        passwordHash: hashPassword(password),
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(appUsersTable.id, user.id))
      .returning();

    res.json({ user: publicUser(updatedUser), token: updatedUser.isEmailVerified ? createUserToken(updatedUser) : null });
  } catch (err) {
    req.log.error({ err }, "Failed to reset password");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
