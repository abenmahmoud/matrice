import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { appUsersTable, betaCodeUsagesTable, betaInviteCodesTable, db } from "@workspace/db";
import { getAuthUser, requireAdmin } from "../lib/auth.js";
import { generateBetaInviteCode } from "../services/betaInviteService.js";
import { logAdminAction } from "../services/adminAuditService.js";

const router = Router();
router.use("/admin", requireAdmin);

router.post("/admin/invites/generate", async (req, res) => {
  const admin = getAuthUser(req);
  if (!admin) return;
  const input = parseGenerateInput(req.body);
  const expiresAt = input.expiresInDays ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000) : null;
  const codes = [];

  for (let i = 0; i < input.count; i++) {
    let code = generateBetaInviteCode();
    for (let retry = 0; retry < 5; retry++) {
      const [exists] = await db.select({ code: betaInviteCodesTable.code }).from(betaInviteCodesTable).where(eq(betaInviteCodesTable.code, code)).limit(1);
      if (!exists) break;
      code = generateBetaInviteCode();
    }
    codes.push({
      code,
      planGranted: input.planGranted,
      durationMonths: input.durationMonths,
      maxUses: input.maxUses,
      expiresAt,
      createdBy: admin.id,
      notes: input.notes,
    });
  }

  await db.insert(betaInviteCodesTable).values(codes);
  await logAdminAction({ adminUserId: admin.id, actionType: "generate_invite_codes", metadata: { count: codes.length, plan: input.planGranted }, ipAddress: req.ip });
  res.status(201).json({ generated: codes.length, codes: codes.map((code) => code.code) });
});

router.get("/admin/invites", async (_req, res) => {
  const codes = await db.select().from(betaInviteCodesTable).orderBy(desc(betaInviteCodesTable.createdAt)).limit(200);
  const now = new Date();
  const active = codes.filter((code) => code.usesCount < code.maxUses && (!code.expiresAt || code.expiresAt > now)).length;
  res.json({
    codes,
    stats: {
      total: codes.length,
      total_uses: codes.reduce((sum, code) => sum + code.usesCount, 0),
      active,
      expired: codes.filter((code) => code.expiresAt && code.expiresAt <= now).length,
    },
  });
});

router.get("/admin/invites/:code/usages", async (req, res) => {
  const usages = await db
    .select({
      id: betaCodeUsagesTable.id,
      code: betaCodeUsagesTable.code,
      usedAt: betaCodeUsagesTable.usedAt,
      userId: betaCodeUsagesTable.userId,
      email: appUsersTable.email,
      displayName: appUsersTable.displayName,
    })
    .from(betaCodeUsagesTable)
    .leftJoin(appUsersTable, eq(betaCodeUsagesTable.userId, appUsersTable.id))
    .where(eq(betaCodeUsagesTable.code, req.params["code"] ?? ""))
    .orderBy(desc(betaCodeUsagesTable.usedAt));
  res.json({ usages });
});

router.delete("/admin/invites/:code", async (req, res) => {
  const admin = getAuthUser(req);
  if (!admin) return;
  await db.update(betaInviteCodesTable).set({ expiresAt: new Date() }).where(eq(betaInviteCodesTable.code, req.params["code"] ?? ""));
  await logAdminAction({ adminUserId: admin.id, actionType: "revoke_invite_code", metadata: { code: req.params["code"] }, ipAddress: req.ip });
  res.json({ ok: true });
});

function parseGenerateInput(body: unknown) {
  const data = typeof body === "object" && body !== null ? body as Record<string, unknown> : {};
  const plan = typeof data["plan_granted"] === "string" && ["studio", "premium", "pro"].includes(data["plan_granted"]) ? data["plan_granted"] : "premium";
  return {
    count: clampInt(Number(data["count"] ?? 10), 1, 50),
    planGranted: plan,
    durationMonths: clampInt(Number(data["duration_months"] ?? 3), 1, 12),
    maxUses: clampInt(Number(data["max_uses"] ?? 1), 1, 10),
    expiresInDays: data["expires_in_days"] === undefined ? undefined : clampInt(Number(data["expires_in_days"]), 7, 365),
    notes: typeof data["notes"] === "string" ? data["notes"].trim().slice(0, 500) : null,
  };
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

export default router;
