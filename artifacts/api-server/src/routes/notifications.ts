import { Router, type IRouter } from "express";
import { z } from "zod";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db, notificationPreferencesTable, notificationsTable } from "@workspace/db";
import { getAuthUser } from "../lib/auth.js";
import { markAllRead, markRead, unreadCount } from "../services/notificationService.js";
import { runBetaExpiryCron } from "../services/betaExpiryCron.js";

const router: IRouter = Router();

router.post("/cron/beta-expiry-check", async (req, res) => {
  const expected = process.env["CRON_SECRET"];
  if (!expected || req.get("X-Cron-Secret") !== expected) {
    res.status(401).json({ error: "INVALID_CRON_SECRET" });
    return;
  }
  res.json(await runBetaExpiryCron());
});

router.get("/notifications", async (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "AUTH_REQUIRED" });
    return;
  }
  const params = z.object({
    unread_only: z.coerce.boolean().default(false),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }).parse(req.query);
  const conditions = [eq(notificationsTable.userId, user.id), isNull(notificationsTable.archivedAt)];
  if (params.unread_only) conditions.push(isNull(notificationsTable.readAt));
  const items = await db.select().from(notificationsTable).where(and(...conditions)).orderBy(desc(notificationsTable.createdAt)).limit(params.limit);
  res.json({ notifications: items, unread_count: await unreadCount(user.id) });
});

router.post("/notifications/read-all", async (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "AUTH_REQUIRED" });
    return;
  }
  res.json({ ok: true, updated: await markAllRead(user.id) });
});

router.post("/notifications/:id/read", async (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "AUTH_REQUIRED" });
    return;
  }
  await markRead(user.id, req.params["id"]);
  res.json({ ok: true });
});

router.get("/notifications/preferences", async (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "AUTH_REQUIRED" });
    return;
  }
  const [prefs] = await db.select().from(notificationPreferencesTable).where(eq(notificationPreferencesTable.userId, user.id)).limit(1);
  if (prefs) {
    res.json({ preferences: prefs });
    return;
  }
  const [created] = await db.insert(notificationPreferencesTable).values({ userId: user.id }).returning();
  res.json({ preferences: created });
});

router.put("/notifications/preferences", async (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "AUTH_REQUIRED" });
    return;
  }
  const input = z.object({
    email_mandate_events: z.boolean().optional(),
    email_export_ready: z.boolean().optional(),
    email_lentille_done: z.boolean().optional(),
    email_beta_warnings: z.boolean().optional(),
    email_support_reply: z.boolean().optional(),
    email_product_updates: z.boolean().optional(),
    inapp_all: z.boolean().optional(),
    digest_frequency: z.enum(["realtime", "daily", "weekly", "never"]).optional(),
  }).parse(req.body);
  const values = {
    emailMandateEvents: input.email_mandate_events,
    emailExportReady: input.email_export_ready,
    emailLentilleDone: input.email_lentille_done,
    emailBetaWarnings: input.email_beta_warnings,
    emailSupportReply: input.email_support_reply,
    emailProductUpdates: input.email_product_updates,
    inappAll: input.inapp_all,
    digestFrequency: input.digest_frequency,
    updatedAt: new Date(),
  };
  await db.insert(notificationPreferencesTable).values({ userId: user.id, ...values }).onConflictDoUpdate({
    target: notificationPreferencesTable.userId,
    set: values,
  });
  res.json({ ok: true });
});

export default router;
