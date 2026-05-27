import { Router } from "express";
import { count, eq } from "drizzle-orm";
import { appUsersTable, db, projectsTable } from "@workspace/db";
import { getAuthUser, requireCreatorMode, requireOwner } from "../lib/auth.js";

const router = Router();

router.post("/creator/toggle-mode", requireOwner, async (_req, res) => {
  const owner = getAuthUser(_req);
  if (!owner) return;
  const [current] = await db.select({ creatorModeEnabled: appUsersTable.creatorModeEnabled }).from(appUsersTable).where(eq(appUsersTable.id, owner.id)).limit(1);
  const enabled = !current?.creatorModeEnabled;
  await db.update(appUsersTable).set({ creatorModeEnabled: enabled, updatedAt: new Date() }).where(eq(appUsersTable.id, owner.id));
  res.json({ creator_mode_enabled: enabled });
});

router.get("/creator/lab/features", requireCreatorMode, (_req, res) => {
  res.json({
    features: [
      { id: "audiobook_voice_clone", name: "Livre audio voix auteur", status: "experimental", description: "Generation livre audio narre par voix auteur via TTS local.", readiness: 0.3 },
      { id: "voice_off_short_video", name: "Voix-off formats courts multilangues", status: "planned", description: "Generation de voix off pour hooks video et pitchs sociaux.", readiness: 0.1 },
      { id: "lentille_video_ai", name: "Lentille Video IA", status: "planned", description: "Analyse pre-production film/serie avec vision multimodale.", readiness: 0.0 },
      { id: "collaborative_writing", name: "Ecriture collaborative temps reel", status: "concept", description: "Edition multi-utilisateurs sur une meme oeuvre.", readiness: 0.0 },
      { id: "prediction_media_v1", name: "Prediction Media V1", status: "experimental", description: "Segmentation audience et score potentiel media.", readiness: 0.2 },
    ],
  });
});

router.get("/creator/system-info", requireOwner, async (_req, res) => {
  const [[users], [projects]] = await Promise.all([
    db.select({ total: count() }).from(appUsersTable),
    db.select({ total: count() }).from(projectsTable),
  ]);
  res.json({
    server: {
      env: process.env["NODE_ENV"] ?? "development",
      node_version: process.version,
      uptime_seconds: Math.floor(process.uptime()),
      memory_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
    database: {
      total_users: Number(users?.total ?? 0),
      total_projects: Number(projects?.total ?? 0),
    },
    services: {
      deepseek_configured: Boolean(process.env["DEEPSEEK_API_KEY"]),
      essuf_sign_configured: Boolean(process.env["ESSUF_SIGN_API_KEY"]),
      stripe_configured: Boolean(process.env["STRIPE_SECRET_KEY"]),
      resend_configured: Boolean(process.env["RESEND_API_KEY"]),
    },
  });
});

export default router;
