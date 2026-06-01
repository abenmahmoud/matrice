import { Router, type IRouter, type Request, type Response } from "express";
import { and, desc, eq, sum } from "drizzle-orm";
import { z } from "zod";
import { appUsersTable, db, projectsTable, salesEntriesTable, workPassportsTable } from "@workspace/db";
import { getAuthUser, type AuthenticatedUser } from "../lib/auth.js";
import { getProductAccess } from "../lib/productAccess.js";
import { resolveAuthorDisplayName } from "../services/authorDisplayNameService.js";
import {
  buildPublishChecklist,
  mapFormatToPublishWorkType,
  splitRevenue,
  suggestSalesChannels,
} from "../services/publishPlanService.js";

const router: IRouter = Router();

function hasGlobalProjectAccess(access: ReturnType<typeof getProductAccess>): boolean {
  return access.viewer.source === "private-mode" || access.viewer.source === "admin-token";
}

type ProjectRow = typeof projectsTable.$inferSelect;
type PublishAccessContext = {
  project: ProjectRow;
  user: AuthenticatedUser | null;
  canWriteSales: boolean;
  authorDisplayName: string;
};

router.get("/projects/:id/publish-plan", async (req, res) => {
  try {
    const context = await resolvePublishAccess(req, res);
    if (!context) return;

    const [passport] = await db
      .select({
        workType: workPassportsTable.workType,
        sealedAt: workPassportsTable.sealedAt,
      })
      .from(workPassportsTable)
      .where(eq(workPassportsTable.projectId, context.project.id))
      .orderBy(desc(workPassportsTable.updatedAt))
      .limit(1);

    const workType = passport?.workType || mapFormatToPublishWorkType(context.project.targetFormat);
    const channels = suggestSalesChannels(workType);
    const checklist = buildPublishChecklist(workType).map((item) => ({
      ...item,
      done: inferChecklistDone(item.id, { passportSealed: Boolean(passport?.sealedAt), hasRawIdea: Boolean(context.project.rawIdea) }),
    }));

    res.json({
      project: {
        id: context.project.id,
        title: context.project.title,
        target_format: context.project.targetFormat,
        author_display_name: context.authorDisplayName,
      },
      work_type: workType,
      channels,
      checklist,
      disclaimer:
        "Matrice prepare et route vers les plateformes. La publication, les contrats, l'encaissement et les reversements restent geres hors plateforme dans cette phase.",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to build publish plan");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/projects/:id/publishing/author", async (req, res) => {
  try {
    const context = await resolvePublishAccess(req, res);
    if (!context) return;
    if (!context.user || !context.canWriteSales) {
      res.status(403).json({ error: "WRITE_ACCESS_REQUIRED" });
      return;
    }

    const input = authorDisplayNameSchema.parse(req.body);
    const normalized = input.author_display_name?.trim() || null;
    const [project] = await db
      .update(projectsTable)
      .set({ authorDisplayName: normalized, updatedAt: new Date() })
      .where(eq(projectsTable.id, context.project.id))
      .returning();

    const authorDisplayName = await resolveProjectAuthorDisplayName(project ?? context.project, context.user);
    await db
      .update(workPassportsTable)
      .set({ displayedAuthor: authorDisplayName, updatedAt: new Date() })
      .where(eq(workPassportsTable.projectId, context.project.id));

    res.json({
      author_display_name: authorDisplayName,
      project_author_display_name: project?.authorDisplayName ?? null,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "INVALID_INPUT", details: err.flatten() });
      return;
    }
    req.log.error({ err }, "Failed to update publishing author");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/projects/:id/sales", async (req, res) => {
  try {
    const context = await resolvePublishAccess(req, res);
    if (!context) return;

    const entries = await db
      .select()
      .from(salesEntriesTable)
      .where(eq(salesEntriesTable.projectId, context.project.id))
      .orderBy(desc(salesEntriesTable.saleDate), desc(salesEntriesTable.createdAt));

    const [{ totalCents }] = await db
      .select({ totalCents: sum(salesEntriesTable.grossAmountCents) })
      .from(salesEntriesTable)
      .where(eq(salesEntriesTable.projectId, context.project.id));

    const grossAmountCents = Number(totalCents ?? 0);
    const split = splitRevenue(grossAmountCents);

    res.json({
      entries: entries.map(serializeSalesEntry),
      totals: serializeSplit(split, entries[0]?.currency ?? "EUR"),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list sales entries");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/projects/:id/sales", async (req, res) => {
  try {
    const context = await resolvePublishAccess(req, res);
    if (!context) return;
    if (!context.user || !context.canWriteSales) {
      res.status(403).json({ error: "WRITE_ACCESS_REQUIRED" });
      return;
    }

    const input = salesEntrySchema.parse(req.body);
    const [entry] = await db
      .insert(salesEntriesTable)
      .values({
        projectId: context.project.id,
        userId: context.user.id,
        channel: input.channel,
        saleDate: new Date(input.date),
        grossAmountCents: amountToCents(input.gross_amount),
        currency: input.currency.toUpperCase(),
        note: input.note ?? "",
      })
      .returning();

    res.status(201).json({ entry: serializeSalesEntry(entry) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "INVALID_INPUT", details: err.flatten() });
      return;
    }
    req.log.error({ err }, "Failed to create sales entry");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/projects/:id/sales/:entryId", async (req, res) => {
  try {
    const context = await resolvePublishAccess(req, res);
    if (!context) return;
    if (!context.user || !context.canWriteSales) {
      res.status(403).json({ error: "WRITE_ACCESS_REQUIRED" });
      return;
    }

    const input = salesEntrySchema.partial().parse(req.body);
    const patch: Partial<typeof salesEntriesTable.$inferInsert> = { updatedAt: new Date() };
    if (input.channel !== undefined) patch.channel = input.channel;
    if (input.date !== undefined) patch.saleDate = new Date(input.date);
    if (input.gross_amount !== undefined) patch.grossAmountCents = amountToCents(input.gross_amount);
    if (input.currency !== undefined) patch.currency = input.currency.toUpperCase();
    if (input.note !== undefined) patch.note = input.note;

    const [entry] = await db
      .update(salesEntriesTable)
      .set(patch)
      .where(and(eq(salesEntriesTable.id, req.params["entryId"] ?? ""), eq(salesEntriesTable.projectId, context.project.id)))
      .returning();

    if (!entry) {
      res.status(404).json({ error: "NOT_FOUND" });
      return;
    }

    res.json({ entry: serializeSalesEntry(entry) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "INVALID_INPUT", details: err.flatten() });
      return;
    }
    req.log.error({ err }, "Failed to update sales entry");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/projects/:id/sales/:entryId", async (req, res) => {
  try {
    const context = await resolvePublishAccess(req, res);
    if (!context) return;
    if (!context.user || !context.canWriteSales) {
      res.status(403).json({ error: "WRITE_ACCESS_REQUIRED" });
      return;
    }

    await db
      .delete(salesEntriesTable)
      .where(and(eq(salesEntriesTable.id, req.params["entryId"] ?? ""), eq(salesEntriesTable.projectId, context.project.id)));

    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete sales entry");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

async function resolvePublishAccess(req: Request, res: Response): Promise<PublishAccessContext | null> {
  const rawProjectId = req.params["id"];
  const projectId = Array.isArray(rawProjectId) ? rawProjectId[0] : rawProjectId;
  if (!projectId) {
    res.status(400).json({ error: "PROJECT_ID_REQUIRED" });
    return null;
  }

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

  const canRead = hasGlobalProjectAccess(access) || Boolean(user && project.ownerUserId === user.id);
  if (!canRead) {
    res.status(404).json({ error: "Projet non trouve" });
    return null;
  }

  return {
    project,
    user,
    canWriteSales: hasGlobalProjectAccess(access) || Boolean(user && project.ownerUserId === user.id),
    authorDisplayName: await resolveProjectAuthorDisplayName(project, user),
  };
}

async function resolveProjectAuthorDisplayName(project: ProjectRow, user: AuthenticatedUser | null): Promise<string> {
  if (project.ownerUserId && project.ownerUserId !== user?.id) {
    const [owner] = await db
      .select({ email: appUsersTable.email, displayName: appUsersTable.displayName })
      .from(appUsersTable)
      .where(eq(appUsersTable.id, project.ownerUserId))
      .limit(1);

    return resolveAuthorDisplayName({
      projectAuthorDisplayName: project.authorDisplayName,
      userDisplayName: owner?.displayName ?? user?.displayName,
      userEmail: owner?.email ?? user?.email,
    });
  }

  return resolveAuthorDisplayName({
    projectAuthorDisplayName: project.authorDisplayName,
    userDisplayName: user?.displayName,
    userEmail: user?.email,
  });
}

function inferChecklistDone(itemId: string, context: { passportSealed: boolean; hasRawIdea: boolean }): boolean {
  if (itemId === "work_passport_sealed" || itemId === "concept_protected") return context.passportSealed;
  if (itemId === "metadata_ready" || itemId === "pitch_ready") return context.hasRawIdea;
  return false;
}

const salesEntrySchema = z.object({
  channel: z.string().min(2).max(120),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  gross_amount: z.coerce.number().positive().max(1_000_000),
  currency: z.string().length(3).default("EUR"),
  note: z.string().max(1000).optional(),
});

const authorDisplayNameSchema = z.object({
  author_display_name: z.string().max(120).optional().nullable(),
});

function amountToCents(amount: number): number {
  return Math.round(amount * 100);
}

function centsToAmount(cents: number): number {
  return Math.round(cents) / 100;
}

function serializeSalesEntry(entry: typeof salesEntriesTable.$inferSelect) {
  const split = splitRevenue(entry.grossAmountCents);
  return {
    id: entry.id,
    project_id: entry.projectId,
    channel: entry.channel,
    date: entry.saleDate.toISOString(),
    gross_amount: centsToAmount(entry.grossAmountCents),
    currency: entry.currency,
    note: entry.note,
    created_at: entry.createdAt.toISOString(),
    updated_at: entry.updatedAt.toISOString(),
    split: serializeSplit(split, entry.currency),
  };
}

function serializeSplit(split: ReturnType<typeof splitRevenue>, currency: string) {
  return {
    gross_amount: centsToAmount(split.grossAmountCents),
    matrice_share: centsToAmount(split.matriceShareCents),
    author_share: centsToAmount(split.authorShareCents),
    currency,
    matrice_percent: 10,
    author_percent: 90,
  };
}

export default router;
