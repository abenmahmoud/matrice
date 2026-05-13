import { Router, type IRouter } from "express";
import { db, workPassportsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  getWorkPassport,
  createOrUpdateWorkPassport,
  sealWorkPassport,
  generatePassportMarkdown,
} from "../services/workPassportService.js";
import { getProductAccess } from "../lib/productAccess.js";
import type { AuthenticatedRequest } from "../lib/auth.js";

const router: IRouter = Router();

// GET /api/projects/:id/passport
router.get("/projects/:id/passport", async (req: AuthenticatedRequest, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user?.id ?? req.anonymousId;

    if (!userId) {
      res.status(401).json({ error: "Authentification requise" });
      return;
    }

    const access = getProductAccess(req);
    if (!access?.viewer?.canReadProject) {
      res.status(403).json({ error: "Accès interdit" });
      return;
    }

    const passport = await getWorkPassport(projectId, userId);

    if (!passport) {
      res.status(200).json({ passport: null });
      return;
    }

    res.json({ passport });
  } catch (err) {
    req.log.error({ err }, "Erreur GET /projects/:id/passport");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/projects/:id/passport/generate
router.post("/projects/:id/passport/generate", async (req: AuthenticatedRequest, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user?.id ?? req.anonymousId;

    if (!userId) {
      res.status(401).json({ error: "Authentification requise" });
      return;
    }

    const access = getProductAccess(req);
    if (!access?.viewer?.canWriteProject) {
      res.status(403).json({ error: "Accès interdit" });
      return;
    }

    // Récupérer le projet pour extraire les données existantes
    const { projectsTable } = await import("@workspace/db");
    const projectRows = await db
      .select()
      .from(projectsTable)
      .where(and(eq(projectsTable.id, projectId), eq(projectsTable.ownerUserId, userId)))
      .limit(1);

    if (projectRows.length === 0) {
      res.status(404).json({ error: "Projet non trouvé" });
      return;
    }

    const project = projectRows[0];

    // Récupérer les données narrative si elles existent
    const { narrativeMatricesTable } = await import("@workspace/db");
    const matrixRows = await db
      .select()
      .from(narrativeMatricesTable)
      .where(eq(narrativeMatricesTable.projectId, projectId))
      .limit(1);
    const matrix = matrixRows[0];

    const { emotionalCoresTable } = await import("@workspace/db");
    const coreRows = await db
      .select()
      .from(emotionalCoresTable)
      .where(eq(emotionalCoresTable.projectId, projectId))
      .limit(1);
    const core = coreRows[0];

    // Construire le passeport à partir des données existantes
    const passportData = {
      officialTitle: project.title ?? "",
      workType: mapFormatToWorkType(project.targetFormat),
      displayedAuthor: req.user?.displayName ?? "",
      genre: project.genre ?? "",
      targetAudience: project.targetAudience ?? "",
      logline: matrix?.logline ?? "",
      shortPitch: matrix?.shortPitch ?? "",
      shortSynopsis: matrix?.longSynopsis ? matrix.longSynopsis.substring(0, 500) : "",
      mainThemes: matrix?.themes ?? [],
      artisticIntention: core?.dominantEmotion
        ? `Émotion dominante : ${core.dominantEmotion}. ${core.transformationArc ?? ""}`
        : "",
      declaredOriginality: project.artisticAmbition ?? "",
      clichRisks: [],
      depositTargets: suggestDepositTargets(project.targetFormat),
      depositChecklist: generateDefaultChecklist(),
      markdownContent: "",
    };

    const passport = await createOrUpdateWorkPassport(projectId, userId, passportData);

    // Générer le markdown
    const markdownContent = generatePassportMarkdown(passport);
    await createOrUpdateWorkPassport(projectId, userId, { markdownContent });

    res.json({ passport: { ...passport, markdownContent } });
  } catch (err) {
    req.log.error({ err }, "Erreur POST /projects/:id/passport/generate");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PATCH /api/projects/:id/passport
router.patch("/projects/:id/passport", async (req: AuthenticatedRequest, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user?.id ?? req.anonymousId;

    if (!userId) {
      res.status(401).json({ error: "Authentification requise" });
      return;
    }

    const access = getProductAccess(req);
    if (!access?.viewer?.canWriteProject) {
      res.status(403).json({ error: "Accès interdit" });
      return;
    }

    const updateData = req.body;
    const allowedFields = [
      "officialTitle", "workType", "displayedAuthor", "pseudonym",
      "language", "countryCulture", "genre", "targetAudience", "status",
      "logline", "shortPitch", "shortSynopsis", "mainThemes",
      "artisticIntention", "declaredOriginality", "clichRisks",
      "depositTargets", "depositChecklist",
    ];

    const filteredData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        filteredData[key] = updateData[key];
      }
    }

    const passport = await createOrUpdateWorkPassport(projectId, userId, filteredData);

    // Régénérer le markdown
    const markdownContent = generatePassportMarkdown(passport);
    const updated = await createOrUpdateWorkPassport(projectId, userId, { markdownContent });

    res.json({ passport: updated });
  } catch (err) {
    req.log.error({ err }, "Erreur PATCH /projects/:id/passport");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/projects/:id/passport/seal
router.post("/projects/:id/passport/seal", async (req: AuthenticatedRequest, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user?.id ?? req.anonymousId;

    if (!userId) {
      res.status(401).json({ error: "Authentification requise" });
      return;
    }

    const access = getProductAccess(req);
    if (!access?.viewer?.canWriteProject) {
      res.status(403).json({ error: "Accès interdit" });
      return;
    }

    const passport = await sealWorkPassport(projectId, userId);
    if (!passport) {
      res.status(404).json({ error: "Passeport non trouvé" });
      return;
    }

    res.json({ passport });
  } catch (err) {
    req.log.error({ err }, "Erreur POST /projects/:id/passport/seal");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/projects/:id/passport/export/md
router.get("/projects/:id/passport/export/md", async (req: AuthenticatedRequest, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user?.id ?? req.anonymousId;

    if (!userId) {
      res.status(401).json({ error: "Authentification requise" });
      return;
    }

    const access = getProductAccess(req);
    if (!access?.viewer?.canReadProject) {
      res.status(403).json({ error: "Accès interdit" });
      return;
    }

    const passport = await getWorkPassport(projectId, userId);
    if (!passport) {
      res.status(404).json({ error: "Passeport non trouvé" });
      return;
    }

    const md = generatePassportMarkdown(passport);

    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="passeport-${passport.officialTitle || projectId}.md"`);
    res.send(md);
  } catch (err) {
    req.log.error({ err }, "Erreur export MD");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Helpers
function mapFormatToWorkType(format: string | null): string {
  const map: Record<string, string> = {
    roman: "roman",
    livre: "roman",
    book: "roman",
    scenario: "scenario",
    screenplay: "scenario",
    film: "film",
    serie: "serie",
    series: "serie",
    "court-metrage": "court-metrage",
    short: "court-metrage",
  };
  return map[format?.toLowerCase() ?? ""] ?? "autre";
}

function suggestDepositTargets(format: string | null): string[] {
  const targets: Record<string, string[]> = {
    roman: ["sgdl", "inpi_esoleau", "isbn_afnil"],
    scenario: ["sacd", "inpi_esoleau", "cnc"],
    film: ["sacd", "inpi_esoleau", "cnc", "festival"],
    serie: ["sacd", "inpi_esoleau", "producteur", "diffuseur"],
    "court-metrage": ["sacd", "festival", "inpi_esoleau"],
  };
  return targets[format?.toLowerCase() ?? ""] ?? ["inpi_esoleau"];
}

function generateDefaultChecklist(): Record<string, boolean> {
  return {
    "Synopsis prêt": false,
    "Note d'intention prête": false,
    "Pitch prêt": false,
    "Export disponible": false,
    "Preuve de version créée": false,
    "Dépôt officiel à faire": false,
  };
}

export default router;
