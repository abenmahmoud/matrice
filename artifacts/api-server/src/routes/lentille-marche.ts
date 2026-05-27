import { randomUUID } from "node:crypto";
import { Router, type IRouter, type Request, type Response } from "express";
import { and, count, desc, eq, gte } from "drizzle-orm";
import { db, lentilleAnalysesTable, projectsTable } from "@workspace/db";
import { getAuthUser, type AuthenticatedUser } from "../lib/auth.js";
import { DeepSeekNotConfiguredError } from "../services/deepseekClient.js";
import { lentilleDoneEmail } from "../services/emailTemplates.js";
import { analyseLentille, type LentilleFormatTarget, type LentilleInput } from "../services/lentilleService.js";
import { notify } from "../services/notificationService.js";
import { markStepCompleted } from "../services/onboardingService.js";

const router: IRouter = Router();

const LENTILLE_QUOTAS: Record<string, number> = {
  free: 0,
  studio: 3,
  premium: 20,
  enterprise: -1,
};

type InputValidationResult =
  | { ok: true; input: LentilleInput & { project_id?: string } }
  | { ok: false; details: Array<{ path: string; message: string }> };

function requireAuth(req: Request, res: Response): AuthenticatedUser | null {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "AUTH_REQUIRED" });
    return null;
  }
  return user;
}

function currentMonthStart(): Date {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  return monthStart;
}

async function usedThisMonth(userId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(lentilleAnalysesTable)
    .where(and(eq(lentilleAnalysesTable.userId, userId), gte(lentilleAnalysesTable.createdAt, currentMonthStart())));
  return Number(row?.value ?? 0);
}

function validateAnalyseInput(body: unknown): InputValidationResult {
  const details: Array<{ path: string; message: string }> = [];
  const data = typeof body === "object" && body !== null ? body as Record<string, unknown> : {};
  const logline = typeof data["logline"] === "string" ? data["logline"].trim() : "";
  const synopsis = typeof data["synopsis"] === "string" ? data["synopsis"].trim() : "";
  const genre = typeof data["genre"] === "string" ? data["genre"].trim() : "";
  const projectId = typeof data["project_id"] === "string" ? data["project_id"].trim() : "";
  const formatTarget = typeof data["format_target"] === "string" ? data["format_target"] : undefined;
  const allowedFormats = ["film", "serie", "microdrama", "open"];

  if (logline.length < 20 || logline.length > 500) {
    details.push({ path: "logline", message: "La logline doit contenir entre 20 et 500 caracteres." });
  }
  if (synopsis.length < 50 || synopsis.length > 5000) {
    details.push({ path: "synopsis", message: "Le synopsis doit contenir entre 50 et 5000 caracteres." });
  }
  if (genre.length > 100) {
    details.push({ path: "genre", message: "Le genre doit contenir 100 caracteres maximum." });
  }
  if (formatTarget && !allowedFormats.includes(formatTarget)) {
    details.push({ path: "format_target", message: "Format vise invalide." });
  }
  if (projectId && projectId.length > 120) {
    details.push({ path: "project_id", message: "Identifiant projet invalide." });
  }

  let scenes: string[] | undefined;
  if (Array.isArray(data["scenes"])) {
    scenes = data["scenes"]
      .map((scene) => String(scene ?? "").trim())
      .filter(Boolean)
      .slice(0, 10);
    if (scenes.some((scene) => scene.length > 500)) {
      details.push({ path: "scenes", message: "Chaque scene cle doit contenir 500 caracteres maximum." });
    }
  }

  if (details.length > 0) return { ok: false, details };

  return {
    ok: true,
    input: {
      logline,
      synopsis,
      ...(genre ? { genre } : {}),
      ...(formatTarget ? { format_target: formatTarget as LentilleFormatTarget } : {}),
      ...(projectId ? { project_id: projectId } : {}),
      ...(scenes?.length ? { scenes } : {}),
    },
  };
}

async function verifyProjectAccess(projectId: string | undefined, user: AuthenticatedUser): Promise<boolean> {
  if (!projectId) return true;
  const [project] = await db
    .select({ ownerUserId: projectsTable.ownerUserId })
    .from(projectsTable)
    .where(eq(projectsTable.id, projectId))
    .limit(1);
  if (!project) return false;
  if (user.role === "owner" || user.role === "admin") return true;
  return project.ownerUserId === user.id;
}

router.post("/lentille-marche/analyse", async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    const limit = LENTILLE_QUOTAS[user.plan] ?? 0;
    if (limit === 0) {
      res.status(403).json({
        error: "PLAN_UPGRADE_REQUIRED",
        required_plan: "studio",
        message: "La Lentille Marche 2026 necessite le plan Studio minimum.",
      });
      return;
    }

    const validation = validateAnalyseInput(req.body);
    if (!validation.ok) {
      res.status(400).json({ error: "INVALID_INPUT", details: validation.details });
      return;
    }

    if (!(await verifyProjectAccess(validation.input.project_id, user))) {
      res.status(404).json({ error: "PROJECT_NOT_FOUND" });
      return;
    }

    if (limit > 0) {
      const used = await usedThisMonth(user.id);
      if (used >= limit) {
        res.status(429).json({
          error: "QUOTA_EXCEEDED",
          limit,
          used,
          period: "month",
          message: `Quota mensuel atteint (${used}/${limit}).`,
        });
        return;
      }
    }

    const result = await analyseLentille(validation.input);
    const id = randomUUID();

    await db.insert(lentilleAnalysesTable).values({
      id,
      userId: user.id,
      projectId: validation.input.project_id ?? null,
      inputLogline: validation.input.logline,
      inputSynopsis: validation.input.synopsis,
      inputGenre: validation.input.genre ?? null,
      inputFormatTarget: validation.input.format_target ?? null,
      scoreMicrodrama: result.scores.microdrama,
      scoreAiProd: result.scores.ai_prod,
      scorePressionSpatiale: result.scores.pression_spatiale,
      scorePersoDeplace: result.scores.perso_deplace,
      scoreHybridation: result.scores.hybridation,
      scoreGlobal: result.scores.global,
      diagnosticCompatible: result.diagnostic_compatible,
      diagnosticRenforcer: result.diagnostic_renforcer,
      propositions: result.propositions,
      hook10s: result.hook_10s,
      microdramaVersion: result.microdrama_version,
      budgetEstimate: result.budget_estimate,
      hybridationProposal: result.hybridation_proposal,
      formatRecommendation: result.format_recommendation,
      formatReasoning: result.format_reasoning,
      modelUsed: result.meta.model,
      tokensUsed: result.meta.tokens,
      costEur: result.meta.cost_eur.toFixed(6),
    });

    await markStepCompleted(user.id, "first_lentille", { analysis_id: id });
    const projectTitle = validation.input.project_id
      ? (await db.select({ title: projectsTable.title }).from(projectsTable).where(eq(projectsTable.id, validation.input.project_id)).limit(1))[0]?.title ?? "Projet"
      : "Projet";
    void notify({
      userId: user.id,
      type: "lentille_done",
      title: "Lentille Marche terminee",
      body: `Score global : ${result.scores.global}/100 pour "${projectTitle}".`,
      actionUrl: `/lentille-marche/${id}`,
      actionLabel: "Voir l'analyse",
      email: lentilleDoneEmail({
        displayName: user.displayName || user.email,
        projectTitle,
        scoreGlobal: result.scores.global,
        analysisUrl: `${process.env["MATRICE_BASE_URL"] ?? "https://matrice.essuf.fr"}/lentille-marche/${id}`,
      }),
    }).catch((err) => req.log.warn({ err }, "Lentille notification failed"));

    res.status(201).json({ id, result });
  } catch (err) {
    if (err instanceof DeepSeekNotConfiguredError) {
      res.status(503).json({
        error: "DEEPSEEK_NOT_CONFIGURED",
        message: "Service d'analyse production non configure.",
      });
      return;
    }
    if (err instanceof SyntaxError) {
      req.log.error({ err }, "Lentille DeepSeek JSON parse failed");
      res.status(502).json({ error: "INVALID_MODEL_RESPONSE" });
      return;
    }
    req.log.error({ err }, "Lentille analyse failed");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/lentille-marche/history", async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    const analyses = await db
      .select({
        id: lentilleAnalysesTable.id,
        projectId: lentilleAnalysesTable.projectId,
        scoreGlobal: lentilleAnalysesTable.scoreGlobal,
        formatRecommendation: lentilleAnalysesTable.formatRecommendation,
        inputLogline: lentilleAnalysesTable.inputLogline,
        modelUsed: lentilleAnalysesTable.modelUsed,
        costEur: lentilleAnalysesTable.costEur,
        createdAt: lentilleAnalysesTable.createdAt,
      })
      .from(lentilleAnalysesTable)
      .where(eq(lentilleAnalysesTable.userId, user.id))
      .orderBy(desc(lentilleAnalysesTable.createdAt))
      .limit(50);

    res.json({ analyses });
  } catch (err) {
    req.log.error({ err }, "Failed to load Lentille history");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/lentille-marche/project/:projectId/latest", async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;
    const projectId = req.params["projectId"];
    if (!(await verifyProjectAccess(projectId, user))) {
      res.status(404).json({ error: "NOT_FOUND" });
      return;
    }

    const [analyse] = await db
      .select()
      .from(lentilleAnalysesTable)
      .where(and(eq(lentilleAnalysesTable.userId, user.id), eq(lentilleAnalysesTable.projectId, projectId)))
      .orderBy(desc(lentilleAnalysesTable.createdAt))
      .limit(1);

    res.json({ analyse: analyse ?? null });
  } catch (err) {
    req.log.error({ err }, "Failed to load project Lentille analysis");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/lentille-marche/quota", async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    const limit = LENTILLE_QUOTAS[user.plan] ?? 0;
    if (limit === 0) {
      res.json({ limit: 0, used: 0, remaining: 0, plan: user.plan, upgrade_required: true });
      return;
    }

    const used = await usedThisMonth(user.id);
    const remaining = limit === -1 ? -1 : Math.max(0, limit - used);
    res.json({ limit, used, remaining, plan: user.plan, upgrade_required: false });
  } catch (err) {
    req.log.error({ err }, "Failed to load Lentille quota");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/lentille-marche/:id", async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    const [analyse] = await db
      .select()
      .from(lentilleAnalysesTable)
      .where(and(eq(lentilleAnalysesTable.id, req.params["id"]), eq(lentilleAnalysesTable.userId, user.id)))
      .limit(1);

    if (!analyse) {
      res.status(404).json({ error: "NOT_FOUND" });
      return;
    }

    res.json({ analyse });
  } catch (err) {
    req.log.error({ err }, "Failed to load Lentille detail");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/lentille-marche/:id", async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    await db
      .delete(lentilleAnalysesTable)
      .where(and(eq(lentilleAnalysesTable.id, req.params["id"]), eq(lentilleAnalysesTable.userId, user.id)));

    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete Lentille analysis");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
