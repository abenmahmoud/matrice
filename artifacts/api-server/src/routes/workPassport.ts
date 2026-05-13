import { Router, type IRouter, type Request, type Response } from "express";
import {
  appUsersTable,
  db,
  emotionalCoresTable,
  narrativeMatricesTable,
  projectsTable,
  researchDataTable,
} from "@workspace/db";
import { and, eq } from "drizzle-orm";
import {
  createOrUpdateWorkPassport,
  generateEnrichedWorkPassportDraft,
  generatePassportMarkdown,
  getWorkPassport,
  sealWorkPassport,
} from "../services/workPassportService.js";
import type { WorkPassportDraft } from "../services/generationService.js";
import { getAuthUser, type AuthenticatedUser } from "../lib/auth.js";
import { getProductAccess } from "../lib/productAccess.js";

const router: IRouter = Router();
const OWNER_PASSPORT_ID = "owner";

type ProjectRow = typeof projectsTable.$inferSelect;

type PassportAccessContext = {
  project: ProjectRow;
  passportOwnerId: string;
  authorName: string;
  user: AuthenticatedUser | null;
};

async function resolvePassportAccess(req: Request, res: Response): Promise<PassportAccessContext | null> {
  const projectId = req.params.id;
  const access = getProductAccess(req);
  const user = getAuthUser(req);

  if (access.viewer.role === "public") {
    res.status(401).json({ error: "AUTH_REQUIRED" });
    return null;
  }

  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, projectId)).limit(1);
  if (!project) {
    res.status(404).json({ error: "Projet non trouve" });
    return null;
  }

  if (access.viewer.role === "owner") {
    const ownerId = project.ownerUserId ?? OWNER_PASSPORT_ID;
    const authorName = await resolveAuthorName(ownerId, user);
    return { project, passportOwnerId: ownerId, authorName, user };
  }

  if (user && project.ownerUserId === user.id) {
    return {
      project,
      passportOwnerId: user.id,
      authorName: user.displayName || user.email,
      user,
    };
  }

  res.status(404).json({ error: "Projet non trouve" });
  return null;
}

async function resolveAuthorName(ownerId: string, user: AuthenticatedUser | null): Promise<string> {
  if (ownerId === OWNER_PASSPORT_ID) return user?.displayName || "Createur Matrice";

  const [owner] = await db
    .select({ email: appUsersTable.email, displayName: appUsersTable.displayName })
    .from(appUsersTable)
    .where(eq(appUsersTable.id, ownerId))
    .limit(1);

  return owner?.displayName || owner?.email || user?.displayName || "Createur Matrice";
}

// GET /api/projects/:id/passport
router.get("/projects/:id/passport", async (req, res) => {
  try {
    const context = await resolvePassportAccess(req, res);
    if (!context) return;

    const passport = await getWorkPassport(context.project.id, context.passportOwnerId);
    res.json({ passport: passport ?? null });
  } catch (err) {
    req.log.error({ err }, "Failed to get work passport");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/projects/:id/passport/generate
router.post("/projects/:id/passport/generate", async (req, res) => {
  try {
    const context = await resolvePassportAccess(req, res);
    if (!context) return;

    const projectId = context.project.id;
    const [matrix] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, projectId)).limit(1);
    const [core] = await db.select().from(emotionalCoresTable).where(eq(emotionalCoresTable.projectId, projectId)).limit(1);
    const [research] = await db.select().from(researchDataTable).where(eq(researchDataTable.projectId, projectId)).limit(1);

    const fallback = buildDeterministicPassport(context.project, context.authorName, matrix, core, research);
    const draft = await generateEnrichedWorkPassportDraft(context.project, {
      displayedAuthor: context.authorName,
      workType: fallback.workType,
      matrix,
      emotionalCore: core,
      research,
      fallback,
    });

    const passport = await createOrUpdateWorkPassport(projectId, context.passportOwnerId, {
      ...fallback,
      ...normalizePassportDraft(draft, fallback),
    });
    const markdownContent = generatePassportMarkdown(passport);
    const updated = await createOrUpdateWorkPassport(projectId, context.passportOwnerId, { markdownContent });

    res.json({ passport: updated });
  } catch (err) {
    req.log.error({ err }, "Failed to generate work passport");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PATCH /api/projects/:id/passport
router.patch("/projects/:id/passport", async (req, res) => {
  try {
    const context = await resolvePassportAccess(req, res);
    if (!context) return;

    const filteredData = filterPassportUpdate(req.body);
    const passport = await createOrUpdateWorkPassport(context.project.id, context.passportOwnerId, filteredData);
    const markdownContent = generatePassportMarkdown(passport);
    const updated = await createOrUpdateWorkPassport(context.project.id, context.passportOwnerId, { markdownContent });

    res.json({ passport: updated });
  } catch (err) {
    req.log.error({ err }, "Failed to update work passport");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/projects/:id/passport/seal
router.post("/projects/:id/passport/seal", async (req, res) => {
  try {
    const context = await resolvePassportAccess(req, res);
    if (!context) return;

    const passport = await sealWorkPassport(context.project.id, context.passportOwnerId);
    if (!passport) {
      res.status(404).json({ error: "Passeport non trouve" });
      return;
    }

    res.json({ passport });
  } catch (err) {
    req.log.error({ err }, "Failed to seal work passport");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/projects/:id/passport/export/md
router.get("/projects/:id/passport/export/md", async (req, res) => {
  try {
    const context = await resolvePassportAccess(req, res);
    if (!context) return;

    const passport = await getWorkPassport(context.project.id, context.passportOwnerId);
    if (!passport) {
      res.status(404).json({ error: "Passeport non trouve" });
      return;
    }

    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename(`passeport-${passport.officialTitle || context.project.id}.md`)}"`);
    res.send(generatePassportMarkdown(passport));
  } catch (err) {
    req.log.error({ err }, "Failed to export work passport markdown");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

function buildDeterministicPassport(
  project: ProjectRow,
  authorName: string,
  matrix?: typeof narrativeMatricesTable.$inferSelect,
  core?: typeof emotionalCoresTable.$inferSelect,
  research?: typeof researchDataTable.$inferSelect
): WorkPassportDraft {
  const workType = mapFormatToWorkType(project.targetFormat);
  const targets = suggestDepositTargets(workType);

  return {
    officialTitle: project.title ?? "",
    workType,
    displayedAuthor: authorName,
    pseudonym: "",
    language: "francais",
    countryCulture: project.realityLevel || "",
    genre: project.genre ?? "",
    targetAudience: project.targetAudience ?? "",
    status: "brouillon",
    logline: matrix?.logline ?? "",
    shortPitch: matrix?.shortPitch ?? "",
    shortSynopsis: matrix?.longSynopsis ? matrix.longSynopsis.slice(0, 900) : project.rawIdea.slice(0, 900),
    mainThemes: matrix?.themes ?? [],
    artisticIntention: project.artisticAmbition || core?.transformationArc || "",
    declaredOriginality: research?.originalityOpportunities?.join(" ") || project.inspirationSources || "",
    clichRisks: research?.clicheRisks ?? [],
    depositTargets: targets,
    depositChecklist: generateDefaultChecklist(targets),
    proofMode: "internal_hash",
    proofProvider: "Matrice Narrative",
    proofExternalReference: "",
    proofNotes:
      "Architecture preparee pour preuve d'anteriorite externe: horodatage qualifie, depot officiel, registre decentralise ou tiers de confiance. Le scellement actuel cree une empreinte SHA-256 interne.",
    legalDisclaimer:
      "Ce document ne remplace pas un depot officiel. Il constitue une preuve interne de version et un guide de preparation vers les organismes adaptes.",
  };
}

function normalizePassportDraft(draft: WorkPassportDraft, fallback: WorkPassportDraft): WorkPassportDraft {
  return {
    ...fallback,
    ...draft,
    officialTitle: stringOr(draft.officialTitle, fallback.officialTitle),
    workType: stringOr(draft.workType, fallback.workType),
    displayedAuthor: stringOr(draft.displayedAuthor, fallback.displayedAuthor),
    status: stringOr(draft.status, fallback.status),
    mainThemes: arrayOr(draft.mainThemes, fallback.mainThemes),
    clichRisks: arrayOr(draft.clichRisks, fallback.clichRisks),
    depositTargets: arrayOr(draft.depositTargets, fallback.depositTargets),
    depositChecklist: objectOr(draft.depositChecklist, fallback.depositChecklist),
  };
}

function filterPassportUpdate(body: unknown): Partial<WorkPassportDraft> {
  const updateData = (body ?? {}) as Record<string, unknown>;
  const allowedFields = [
    "officialTitle", "workType", "displayedAuthor", "pseudonym",
    "language", "countryCulture", "genre", "targetAudience", "status",
    "logline", "shortPitch", "shortSynopsis", "mainThemes",
    "artisticIntention", "declaredOriginality", "clichRisks",
    "depositTargets", "depositChecklist", "proofMode", "proofProvider",
    "proofExternalReference", "proofNotes", "legalDisclaimer",
  ];

  const filteredData: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (updateData[key] !== undefined) filteredData[key] = updateData[key];
  }
  return filteredData as Partial<WorkPassportDraft>;
}

function mapFormatToWorkType(format: string | null): string {
  const normalized = format?.toLowerCase() ?? "";
  if (normalized.includes("roman") || normalized.includes("livre") || normalized.includes("book")) return "roman";
  if (normalized.includes("court")) return "court-metrage";
  if (normalized.includes("scenario") || normalized.includes("scenar") || normalized.includes("screenplay")) return "scenario";
  if (normalized.includes("film") || normalized.includes("long")) return "film";
  if (normalized.includes("serie") || normalized.includes("series")) return "serie";
  return "autre";
}

function suggestDepositTargets(workType: string): string[] {
  const targets: Record<string, string[]> = {
    roman: ["sgdl", "inpi_esoleau", "isbn_afnil"],
    scenario: ["sacd", "inpi_esoleau", "cnc"],
    film: ["sacd", "inpi_esoleau", "cnc", "festival", "isan_eidr"],
    serie: ["sacd", "inpi_esoleau", "producteur", "diffuseur"],
    "court-metrage": ["sacd", "festival", "inpi_esoleau", "isan_eidr"],
  };
  return targets[workType] ?? ["inpi_esoleau"];
}

function generateDefaultChecklist(targets: string[]): Record<string, boolean> {
  return {
    "Synopsis pret": false,
    "Note d'intention prete": false,
    "Pitch pret": false,
    "Export disponible": false,
    "Preuve de version creee": false,
    "Depot officiel a faire": targets.length > 0,
  };
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function arrayOr(value: unknown, fallback: string[]): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : fallback;
}

function objectOr(value: unknown, fallback: Record<string, boolean>): Record<string, boolean> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter((entry): entry is [string, boolean] => typeof entry[1] === "boolean")
  );
}

function safeFilename(value: string): string {
  return value.replace(/[\\/:*?"<>|]+/g, "-").slice(0, 120);
}

export default router;
