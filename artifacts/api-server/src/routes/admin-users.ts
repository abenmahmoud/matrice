import { createAuthActionToken } from "../lib/auth.js";
import { Router, type Request, type Response } from "express";
import { and, count, desc, eq, gte, ilike, or } from "drizzle-orm";
import {
  adminAuditLogTable,
  appUsersTable,
  betaCodeUsagesTable,
  db,
  delegationMandateTable,
  exportJobsTable,
  lentilleAnalysesTable,
  projectsTable,
} from "@workspace/db";
import { getAuthUser, requireAdmin } from "../lib/auth.js";
import { sendPasswordResetEmail } from "../services/emailService.js";
import { logAdminAction } from "../services/adminAuditService.js";
import { getBalance, getHistory, grantCredits, spendCredits } from "../services/creditsService.js";

const router = Router();
router.use("/admin", requireAdmin);

const VALID_PLANS = ["free", "studio", "premium", "pro", "publish", "enterprise"] as const;
const VALID_STATUSES = ["active", "suspended", "deleted"] as const;

router.get("/admin/dashboard", async (_req, res) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    [totalUsers],
    [activeUsers],
    [suspendedUsers],
    usersByPlan,
    [new7],
    [new30],
    [betaTesters],
    [totalProjects],
    [totalLentille],
    [lentille7d],
    [totalExports],
    [totalMandates],
    [activeMandates],
  ] = await Promise.all([
    db.select({ total: count() }).from(appUsersTable),
    db.select({ total: count() }).from(appUsersTable).where(eq(appUsersTable.status, "active")),
    db.select({ total: count() }).from(appUsersTable).where(eq(appUsersTable.status, "suspended")),
    db.select({ plan: appUsersTable.plan, total: count() }).from(appUsersTable).where(eq(appUsersTable.status, "active")).groupBy(appUsersTable.plan),
    db.select({ total: count() }).from(appUsersTable).where(gte(appUsersTable.createdAt, sevenDaysAgo)),
    db.select({ total: count() }).from(appUsersTable).where(gte(appUsersTable.createdAt, thirtyDaysAgo)),
    db.select({ total: count() }).from(appUsersTable).where(eq(appUsersTable.isBetaTester, true)),
    db.select({ total: count() }).from(projectsTable),
    db.select({ total: count() }).from(lentilleAnalysesTable),
    db.select({ total: count() }).from(lentilleAnalysesTable).where(gte(lentilleAnalysesTable.createdAt, sevenDaysAgo)),
    db.select({ total: count() }).from(exportJobsTable),
    db.select({ total: count() }).from(delegationMandateTable),
    db.select({ total: count() }).from(delegationMandateTable).where(eq(delegationMandateTable.status, "active")),
  ]);

  const byPlan = Object.fromEntries(usersByPlan.map((row) => [row.plan, Number(row.total)]));
  const pricing: Record<string, number> = { free: 0, studio: 4.99, premium: 9.99, pro: 0, publish: 0, enterprise: 0 };
  const mrrEur = usersByPlan.reduce((sum, row) => sum + (pricing[row.plan] ?? 0) * Number(row.total), 0);

  res.json({
    users: {
      total: Number(totalUsers?.total ?? 0),
      active: Number(activeUsers?.total ?? 0),
      suspended: Number(suspendedUsers?.total ?? 0),
      new_7d: Number(new7?.total ?? 0),
      new_30d: Number(new30?.total ?? 0),
      beta_testers: Number(betaTesters?.total ?? 0),
      by_plan: byPlan,
    },
    projects: { total: Number(totalProjects?.total ?? 0) },
    lentille: { total: Number(totalLentille?.total ?? 0), last_7d: Number(lentille7d?.total ?? 0) },
    exports: { total: Number(totalExports?.total ?? 0) },
    mandates: { total: Number(totalMandates?.total ?? 0), active: Number(activeMandates?.total ?? 0) },
    revenue: { mrr_eur: Math.round(mrrEur), annual_estimate_eur: Math.round(mrrEur * 12) },
  });
});

router.get("/admin/users", async (req, res) => {
  const params = parseUsersParams(req);
  const filters = [];
  if (params.search) {
    filters.push(or(ilike(appUsersTable.email, `%${params.search}%`), ilike(appUsersTable.displayName, `%${params.search}%`)));
  }
  if (params.plan) filters.push(eq(appUsersTable.plan, params.plan));
  if (params.status !== "all") filters.push(eq(appUsersTable.status, params.status));
  const where = filters.length > 0 ? and(...filters) : undefined;
  const offset = (params.page - 1) * params.pageSize;

  const [[totalRow], users] = await Promise.all([
    db.select({ total: count() }).from(appUsersTable).where(where),
    db
      .select({
        id: appUsersTable.id,
        email: appUsersTable.email,
        displayName: appUsersTable.displayName,
        role: appUsersTable.role,
        plan: appUsersTable.plan,
        status: appUsersTable.status,
        isBetaTester: appUsersTable.isBetaTester,
        betaExpiresAt: appUsersTable.betaExpiresAt,
        generationsUsed: appUsersTable.generationsUsed,
        projectsCreated: appUsersTable.projectsCreated,
        onboardingStep: appUsersTable.onboardingStep,
        monthlyCredits: appUsersTable.monthlyCredits,
        extraCredits: appUsersTable.extraCredits,
        creditsRenewAt: appUsersTable.creditsRenewAt,
        createdAt: appUsersTable.createdAt,
        updatedAt: appUsersTable.updatedAt,
      })
      .from(appUsersTable)
      .where(where)
      .orderBy(params.sortOrder === "asc" ? appUsersTable.createdAt : desc(appUsersTable.createdAt))
      .limit(params.pageSize)
      .offset(offset),
  ]);

  res.json({
    users,
    pagination: {
      total: Number(totalRow?.total ?? 0),
      page: params.page,
      page_size: params.pageSize,
      total_pages: Math.max(1, Math.ceil(Number(totalRow?.total ?? 0) / params.pageSize)),
    },
  });
});

router.get("/admin/users/:id", async (req, res) => {
  const userId = req.params["id"] ?? "";
  const [user] = await db
    .select({
      id: appUsersTable.id,
      email: appUsersTable.email,
      displayName: appUsersTable.displayName,
      role: appUsersTable.role,
      plan: appUsersTable.plan,
      status: appUsersTable.status,
      generationsUsed: appUsersTable.generationsUsed,
      projectsCreated: appUsersTable.projectsCreated,
      creatorModeEnabled: appUsersTable.creatorModeEnabled,
      isBetaTester: appUsersTable.isBetaTester,
      betaStartedAt: appUsersTable.betaStartedAt,
      betaExpiresAt: appUsersTable.betaExpiresAt,
      onboardingStep: appUsersTable.onboardingStep,
      onboardingCompletedAt: appUsersTable.onboardingCompletedAt,
      monthlyCredits: appUsersTable.monthlyCredits,
      extraCredits: appUsersTable.extraCredits,
      creditsRenewAt: appUsersTable.creditsRenewAt,
      createdAt: appUsersTable.createdAt,
      updatedAt: appUsersTable.updatedAt,
    })
    .from(appUsersTable)
    .where(eq(appUsersTable.id, userId))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: "NOT_FOUND" });
    return;
  }

  const [projects, [lentille], [exports], mandates, betaUsages, recentActions, creditBalance, creditHistory] = await Promise.all([
    db.select({ id: projectsTable.id, title: projectsTable.title, genre: projectsTable.genre, updatedAt: projectsTable.updatedAt, createdAt: projectsTable.createdAt }).from(projectsTable).where(eq(projectsTable.ownerUserId, user.id)).orderBy(desc(projectsTable.updatedAt)).limit(50),
    db.select({ total: count() }).from(lentilleAnalysesTable).where(eq(lentilleAnalysesTable.userId, user.id)),
    db.select({ total: count() }).from(exportJobsTable).where(eq(exportJobsTable.userId, user.id)),
    db.select().from(delegationMandateTable).where(eq(delegationMandateTable.userId, user.id)).orderBy(desc(delegationMandateTable.createdAt)),
    db.select().from(betaCodeUsagesTable).where(eq(betaCodeUsagesTable.userId, user.id)).orderBy(desc(betaCodeUsagesTable.usedAt)),
    db.select().from(adminAuditLogTable).where(eq(adminAuditLogTable.targetUserId, user.id)).orderBy(desc(adminAuditLogTable.createdAt)).limit(20),
    getBalance(user.id),
    getHistory(user.id, 25),
  ]);

  const healthFlags = [];
  if (daysSince(user.createdAt) > 3 && projects.length === 0) healthFlags.push({ level: "warning", message: "Inscrit depuis 3+ jours sans projet cree" });
  if (user.status === "suspended") healthFlags.push({ level: "error", message: "Compte suspendu" });
  if (user.isBetaTester && user.betaExpiresAt && user.betaExpiresAt < new Date()) healthFlags.push({ level: "warning", message: "Periode beta expiree" });

  res.json({
    user,
    stats: {
      projects_count: projects.length,
      lentille_analyses: Number(lentille?.total ?? 0),
      exports: Number(exports?.total ?? 0),
      mandates: mandates.length,
      active_mandates: mandates.filter((mandate) => mandate.status === "active").length,
    },
    projects,
    mandates,
    credits: {
      balance: creditBalance,
      renew_at: user.creditsRenewAt,
      history: creditHistory,
    },
    beta_usages: betaUsages,
    recent_admin_actions: recentActions,
    health_flags: healthFlags,
  });
});

router.post("/admin/users/:id/credits", async (req, res) => {
  const admin = getAuthUser(req);
  if (!admin) return;

  const target = await loadTargetUser(req, res);
  if (!target) return;
  if (target.role === "owner" && admin.role !== "owner") {
    res.status(403).json({ error: "CANNOT_ADJUST_OWNER_CREDITS" });
    return;
  }

  const rawAmount = Number(req.body?.amount);
  const amount = Number.isFinite(rawAmount) ? clampInt(rawAmount, -10_000, 10_000) : 0;
  const reason = bodyString(req.body, "reason");
  if (amount === 0 || reason.length < 5 || reason.length > 500) {
    res.status(400).json({ error: "INVALID_CREDIT_ADJUSTMENT" });
    return;
  }

  const meta = JSON.stringify({
    admin_user_id: admin.id,
    reason,
    source: "admin_user_detail",
  });
  const result = amount > 0
    ? { ok: true as const, balance: await grantCredits(target.id, amount, "admin_adjustment", meta) }
    : await spendCredits(target.id, Math.abs(amount), "admin_adjustment", meta);

  if (!result.ok) {
    res.status(409).json({ error: "INSUFFICIENT_CREDITS", needed: result.needed, balance: result.available });
    return;
  }

  await logAdminAction({
    adminUserId: admin.id,
    actionType: "adjust_credits",
    targetUserId: target.id,
    metadata: { amount, reason, balance_after: result.balance.total },
    ipAddress: req.ip,
  });

  res.json({ ok: true, balance: result.balance });
});

router.post("/admin/users/:id/suspend", async (req, res) => {
  const admin = getAuthUser(req);
  if (!admin) return;
  const reason = bodyString(req.body, "reason");
  if (reason.length < 5 || reason.length > 500) {
    res.status(400).json({ error: "REASON_REQUIRED" });
    return;
  }
  const target = await loadTargetUser(req, res);
  if (!target) return;
  if (target.role === "owner") {
    res.status(403).json({ error: "CANNOT_SUSPEND_OWNER" });
    return;
  }
  await db.update(appUsersTable).set({ status: "suspended", updatedAt: new Date() }).where(eq(appUsersTable.id, target.id));
  await logAdminAction({ adminUserId: admin.id, actionType: "suspend_user", targetUserId: target.id, metadata: { reason }, ipAddress: req.ip });
  res.json({ ok: true, status: "suspended" });
});

router.post("/admin/users/:id/reactivate", async (req, res) => {
  const admin = getAuthUser(req);
  if (!admin) return;
  const target = await loadTargetUser(req, res);
  if (!target) return;
  await db.update(appUsersTable).set({ status: "active", updatedAt: new Date() }).where(eq(appUsersTable.id, target.id));
  await logAdminAction({ adminUserId: admin.id, actionType: "reactivate_user", targetUserId: target.id, ipAddress: req.ip });
  res.json({ ok: true, status: "active" });
});

router.post("/admin/users/:id/change-plan", async (req, res) => {
  const admin = getAuthUser(req);
  if (!admin) return;
  const plan = bodyString(req.body, "plan");
  const reason = bodyString(req.body, "reason");
  if (!VALID_PLANS.includes(plan as never) || reason.length < 5) {
    res.status(400).json({ error: "INVALID_INPUT" });
    return;
  }
  const target = await loadTargetUser(req, res);
  if (!target) return;
  if (target.role === "owner" && admin.role !== "owner") {
    res.status(403).json({ error: "CANNOT_CHANGE_OWNER" });
    return;
  }
  await db.update(appUsersTable).set({ plan, updatedAt: new Date() }).where(eq(appUsersTable.id, target.id));
  await logAdminAction({ adminUserId: admin.id, actionType: "change_plan", targetUserId: target.id, metadata: { old_plan: target.plan, new_plan: plan, reason }, ipAddress: req.ip });
  res.json({ ok: true, plan });
});

router.post("/admin/users/:id/reset-password", async (req, res) => {
  const admin = getAuthUser(req);
  if (!admin) return;
  const target = await loadTargetUser(req, res);
  if (!target) return;
  const token = createAuthActionToken();
  const [updated] = await db.update(appUsersTable).set({
    passwordResetToken: token,
    passwordResetExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  }).where(eq(appUsersTable.id, target.id)).returning();
  await sendPasswordResetEmail({ to: updated.email, displayName: updated.displayName, token });
  await logAdminAction({ adminUserId: admin.id, actionType: "reset_password", targetUserId: target.id, ipAddress: req.ip });
  res.json({ ok: true });
});

router.post("/admin/users/:id/grant-beta", async (req, res) => {
  const admin = getAuthUser(req);
  if (!admin) return;
  const durationMonths = clampInt(Number(req.body?.duration_months ?? 3), 1, 12);
  const plan = bodyString(req.body, "plan_during_beta") || "premium";
  if (!["studio", "premium", "pro"].includes(plan)) {
    res.status(400).json({ error: "INVALID_PLAN" });
    return;
  }
  const target = await loadTargetUser(req, res);
  if (!target) return;
  const now = new Date();
  const betaExpiresAt = new Date(now.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);
  await db.update(appUsersTable).set({
    isBetaTester: true,
    betaStartedAt: now,
    betaExpiresAt,
    plan,
    updatedAt: new Date(),
  }).where(eq(appUsersTable.id, target.id));
  await logAdminAction({ adminUserId: admin.id, actionType: "grant_beta", targetUserId: target.id, metadata: { duration_months: durationMonths, plan }, ipAddress: req.ip });
  res.json({ ok: true, beta_expires_at: betaExpiresAt.toISOString(), plan });
});

router.get("/admin/audit", async (req, res) => {
  const limit = clampInt(Number(req.query["limit"] ?? 100), 1, 200);
  const actions = await db.select().from(adminAuditLogTable).orderBy(desc(adminAuditLogTable.createdAt)).limit(limit);
  res.json({ actions });
});

async function loadTargetUser(req: Request, res: Response) {
  const idParam = req.params["id"];
  const targetId = typeof idParam === "string" ? idParam : "";
  const [target] = await db.select().from(appUsersTable).where(eq(appUsersTable.id, targetId)).limit(1);
  if (!target) {
    res.status(404).json({ error: "NOT_FOUND" });
    return null;
  }
  return target;
}

function parseUsersParams(req: Request) {
  const plan = typeof req.query["plan"] === "string" && VALID_PLANS.includes(req.query["plan"] as never) ? req.query["plan"] : undefined;
  const status = typeof req.query["status"] === "string" && [...VALID_STATUSES, "all"].includes(req.query["status"]) ? req.query["status"] : "all";
  return {
    search: typeof req.query["search"] === "string" ? req.query["search"].trim() : "",
    plan,
    status,
    page: clampInt(Number(req.query["page"] ?? 1), 1, 10_000),
    pageSize: clampInt(Number(req.query["page_size"] ?? 25), 1, 100),
    sortOrder: req.query["sort_order"] === "asc" ? "asc" as const : "desc" as const,
  };
}

function bodyString(body: unknown, key: string): string {
  return typeof body === "object" && body !== null && typeof (body as Record<string, unknown>)[key] === "string"
    ? String((body as Record<string, unknown>)[key]).trim()
    : "";
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export default router;
