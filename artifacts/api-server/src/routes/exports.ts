import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { Router, type IRouter, type NextFunction, type Request, type Response } from "express";
import { and, desc, eq, isNotNull, lt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db, exportJobsTable, workPassportsTable } from "@workspace/db";
import { getAuthUser, type AuthenticatedUser } from "../lib/auth.js";
import { generateDocxManuscript } from "../services/exports/docxGenerator.js";
import { generateEpub } from "../services/exports/epubGenerator.js";
import { generateKdpPdf } from "../services/exports/kdpPdfGenerator.js";

const router: IRouter = Router();
const EXPORTS_DIR = process.env["EXPORTS_DIR"] || "/opt/matrice/exports";
const TOKEN_TTL_MS = 60 * 60 * 1000;

type FormatType = "epub3" | "docx_manuscript" | "pdf_kdp";
type AuthenticatedRequest = Request & { exportUser: AuthenticatedUser };

const FORMAT_EXTENSIONS: Record<FormatType, string> = {
  epub3: "epub",
  docx_manuscript: "docx",
  pdf_kdp: "pdf",
};

const FORMAT_MIMETYPES: Record<FormatType, string> = {
  epub3: "application/epub+zip",
  docx_manuscript: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf_kdp: "application/pdf",
};

router.post("/projects/:id/passport/export/epub", requireAuth, async (req, res) => {
  await startExport(req as AuthenticatedRequest, res, "epub3");
});

router.post("/projects/:id/passport/export/docx", requireAuth, async (req, res) => {
  await startExport(req as AuthenticatedRequest, res, "docx_manuscript");
});

router.post("/projects/:id/passport/export/kdp-pdf", requireAuth, async (req, res) => {
  await startExport(req as AuthenticatedRequest, res, "pdf_kdp");
});

router.get("/exports/:jobId", requireAuth, async (req, res) => {
  const user = (req as AuthenticatedRequest).exportUser;
  const [job] = await db
    .select()
    .from(exportJobsTable)
    .where(and(eq(exportJobsTable.id, routeParam(req, "jobId")), eq(exportJobsTable.userId, user.id)))
    .limit(1);

  if (!job) {
    res.status(404).json({ error: "Export introuvable" });
    return;
  }

  res.json({
    jobId: job.id,
    workPassportId: job.workPassportId,
    format: job.format,
    status: job.status,
    progressPct: job.progressPct,
    errorMessage: job.errorMessage,
    downloadUrl:
      job.outputDownloadToken && job.status === "completed"
        ? `/api/exports/download/${job.outputDownloadToken}`
        : null,
    expiresAt: job.outputExpiresAt,
    fileSizeBytes: job.outputFileSizeBytes,
  });
});

router.get("/exports/list", requireAuth, async (req, res) => {
  const user = (req as AuthenticatedRequest).exportUser;
  const jobs = await db
    .select()
    .from(exportJobsTable)
    .where(eq(exportJobsTable.userId, user.id))
    .orderBy(desc(exportJobsTable.createdAt))
    .limit(50);

  const now = new Date();
  res.json({
    jobs: jobs.map((job) => ({
      jobId: job.id,
      workPassportId: job.workPassportId,
      format: job.format,
      status: job.status,
      progressPct: job.progressPct,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      downloadUrl:
        job.outputDownloadToken && job.status === "completed" && job.outputExpiresAt && job.outputExpiresAt > now
          ? `/api/exports/download/${job.outputDownloadToken}`
          : null,
      fileSizeBytes: job.outputFileSizeBytes,
    })),
  });
});

router.get("/exports/download/:token", async (req, res) => {
  const [job] = await db
    .select()
    .from(exportJobsTable)
    .where(and(eq(exportJobsTable.outputDownloadToken, routeParam(req, "token")), eq(exportJobsTable.status, "completed")))
    .limit(1);

  if (!job?.outputFilePath) {
    res.status(404).json({ error: "Lien de telechargement invalide" });
    return;
  }

  if (job.outputExpiresAt && job.outputExpiresAt < new Date()) {
    res.status(410).json({ error: "Lien de telechargement expire" });
    return;
  }

  const [passport] = await db
    .select({ officialTitle: workPassportsTable.officialTitle })
    .from(workPassportsTable)
    .where(eq(workPassportsTable.id, job.workPassportId))
    .limit(1);

  const format = job.format as FormatType;
  const filename = `${slugify(passport?.officialTitle || "oeuvre")}.${FORMAT_EXTENSIONS[format]}`;

  res.set("Content-Type", FORMAT_MIMETYPES[format]);
  res.set("Content-Disposition", `attachment; filename="${filename}"`);
  res.sendFile(job.outputFilePath);
});

router.post("/cron/cleanup-exports", requireCronSecret, async (_req, res) => {
  const expiredJobs = await db
    .select()
    .from(exportJobsTable)
    .where(and(eq(exportJobsTable.status, "completed"), isNotNull(exportJobsTable.outputExpiresAt), lt(exportJobsTable.outputExpiresAt, new Date())))
    .limit(500);

  let deletedFiles = 0;
  for (const job of expiredJobs) {
    if (!job.outputFilePath) continue;
    try {
      await fs.rm(job.outputFilePath, { force: true });
      deletedFiles += 1;
    } catch (err) {
      console.warn(`[exports] nettoyage impossible pour ${job.id}`, err);
    }
  }

  res.json({ scanned: expiredJobs.length, deleted: deletedFiles });
});

async function startExport(req: AuthenticatedRequest, res: Response, format: FormatType): Promise<void> {
  try {
    const jobId = await createAndProcessJob(req.exportUser.id, routeParam(req, "id"), format);
    res.status(202).json({ jobId, status: "processing" });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Export impossible" });
  }
}

async function createAndProcessJob(userId: string, projectId: string, format: FormatType): Promise<string> {
  const [passport] = await db
    .select()
    .from(workPassportsTable)
    .where(and(eq(workPassportsTable.projectId, projectId), eq(workPassportsTable.ownerUserId, userId)))
    .limit(1);

  if (!passport) {
    throw new Error("Oeuvre introuvable ou acces refuse");
  }

  if (!passport.sealedAt) {
    throw new Error("L'oeuvre doit etre verrouillee avant l'export");
  }

  const jobId = nanoid();
  await db.insert(exportJobsTable).values({
    id: jobId,
    userId,
    workPassportId: passport.id,
    format,
    status: "pending",
    progressPct: 0,
  });

  void processExportJob(jobId).catch(async (err) => {
    console.error(`[exports] echec du job ${jobId}`, err);
    await db
      .update(exportJobsTable)
      .set({
        status: "failed",
        errorMessage: err instanceof Error ? err.message : "Erreur inconnue",
        completedAt: new Date(),
      })
      .where(eq(exportJobsTable.id, jobId));
  });

  return jobId;
}

async function processExportJob(jobId: string): Promise<void> {
  await updateJob(jobId, { status: "processing", startedAt: new Date(), progressPct: 10 });

  const [job] = await db.select().from(exportJobsTable).where(eq(exportJobsTable.id, jobId)).limit(1);
  if (!job) {
    throw new Error("Job d'export introuvable");
  }

  await updateJob(jobId, { progressPct: 30 });

  let buffer: Buffer;
  switch (job.format) {
    case "epub3":
      buffer = await generateEpub(job.workPassportId);
      break;
    case "docx_manuscript":
      buffer = await generateDocxManuscript(job.workPassportId);
      break;
    case "pdf_kdp":
      buffer = await generateKdpPdf(job.workPassportId);
      break;
    default:
      throw new Error(`Format non supporte: ${job.format}`);
  }

  await updateJob(jobId, { progressPct: 80 });

  const format = job.format as FormatType;
  const outputDir = path.join(EXPORTS_DIR, job.userId, job.workPassportId, jobId);
  const outputPath = path.join(outputDir, `output.${FORMAT_EXTENSIONS[format]}`);

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, buffer);

  await updateJob(jobId, {
    status: "completed",
    progressPct: 100,
    outputFilePath: outputPath,
    outputFileSizeBytes: buffer.length,
    outputDownloadToken: crypto.randomBytes(32).toString("base64url"),
    outputExpiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    completedAt: new Date(),
  });
}

async function updateJob(jobId: string, patch: Partial<typeof exportJobsTable.$inferInsert>): Promise<void> {
  await db.update(exportJobsTable).set(patch).where(eq(exportJobsTable.id, jobId));
}

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "AUTH_REQUIRED" });
    return;
  }

  (req as AuthenticatedRequest).exportUser = user;
  next();
}

function requireCronSecret(req: Request, res: Response, next: NextFunction): void {
  const cronSecret = process.env["CRON_SECRET"];
  if (!cronSecret || req.get("X-Cron-Secret") !== cronSecret) {
    res.status(401).json({ error: "Acces cron refuse" });
    return;
  }

  next();
}

function routeParam(req: Request, name: string): string {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60) || "oeuvre";
}

export default router;
