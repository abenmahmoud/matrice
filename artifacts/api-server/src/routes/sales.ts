import { Router, type IRouter, type Request, type Response } from "express";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db, projectsTable, salesEntriesTable, salesSettlementsTable } from "@workspace/db";
import { getAuthUser, type AuthenticatedUser } from "../lib/auth.js";
import { buildMineSalesPayload, type MineSalesSourceRow } from "../services/salesMineService.js";

const router: IRouter = Router();

function requireUser(req: Request, res: Response): AuthenticatedUser | null {
  const user = getAuthUser(req);
  if (!user?.id) {
    res.status(401).json({ error: "AUTH_REQUIRED" });
    return null;
  }
  return user;
}

router.get("/sales/mine", async (req, res) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;

    const saleRows = await db
      .select({
        id: salesEntriesTable.id,
        userId: salesEntriesTable.userId,
        projectId: salesEntriesTable.projectId,
        projectTitle: projectsTable.title,
        channel: salesEntriesTable.channel,
        saleDate: salesEntriesTable.saleDate,
        grossAmountCents: salesEntriesTable.grossAmountCents,
        currency: salesEntriesTable.currency,
      })
      .from(salesEntriesTable)
      .innerJoin(projectsTable, eq(projectsTable.id, salesEntriesTable.projectId))
      .where(eq(salesEntriesTable.userId, user.id))
      .orderBy(desc(salesEntriesTable.saleDate), desc(salesEntriesTable.createdAt));

    const saleIds = saleRows.map((row) => row.id);
    const settlementRows = saleIds.length
      ? await db
        .select({
          salesEntryId: salesSettlementsTable.salesEntryId,
          status: salesSettlementsTable.status,
          kycStatus: salesSettlementsTable.kycStatus,
          updatedAt: salesSettlementsTable.updatedAt,
        })
        .from(salesSettlementsTable)
        .where(and(eq(salesSettlementsTable.userId, user.id), inArray(salesSettlementsTable.salesEntryId, saleIds)))
        .orderBy(desc(salesSettlementsTable.updatedAt))
      : [];

    const latestSettlementBySaleId = new Map<string, { status: string; kycStatus: string; updatedAt: Date | null }>();
    for (const settlement of settlementRows) {
      if (settlement.salesEntryId && !latestSettlementBySaleId.has(settlement.salesEntryId)) {
        latestSettlementBySaleId.set(settlement.salesEntryId, {
          status: settlement.status,
          kycStatus: settlement.kycStatus,
          updatedAt: settlement.updatedAt,
        });
      }
    }

    const payloadRows: MineSalesSourceRow[] = saleRows.map((row) => ({
      ...row,
      settlement: latestSettlementBySaleId.get(row.id) ?? null,
    }));

    res.json(buildMineSalesPayload(user.id, payloadRows));
  } catch (err) {
    req.log.error({ err }, "Failed to list author sales");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
