import { Router, type IRouter } from "express";
import { and, eq, isNotNull } from "drizzle-orm";
import { db, workPassportsTable } from "@workspace/db";
import { upgradeProof, verifyProof } from "../services/openTimestampsService.js";

const router: IRouter = Router();

router.post("/cron/ots-upgrade", async (req, res) => {
  const cronSecret = process.env["CRON_SECRET"];
  const providedSecret = req.get("X-Cron-Secret");

  if (!cronSecret || providedSecret !== cronSecret) {
    res.status(401).json({ error: "Acces cron refuse" });
    return;
  }

  const limit = sanitizeLimit(req.query["limit"]);
  const pendingPassports = await db
    .select()
    .from(workPassportsTable)
    .where(and(eq(workPassportsTable.otsStatus, "pending"), isNotNull(workPassportsTable.otsProof)))
    .limit(limit);

  const results = [];

  for (const passport of pendingPassports) {
    try {
      if (!passport.otsProof) continue;
      const upgraded = await upgradeProof(passport.otsProof);
      await db
        .update(workPassportsTable)
        .set({
          otsProof: upgraded.ots,
          otsStatus: upgraded.status,
          otsBlockchain: upgraded.blockchain ?? passport.otsBlockchain ?? "bitcoin",
          otsBlockHeight: upgraded.blockHeight ?? passport.otsBlockHeight,
          otsTxId: upgraded.blockchainTx ?? passport.otsTxId,
          otsConfirmedAt: upgraded.confirmedAt ?? passport.otsConfirmedAt,
          proofExternalReference: upgraded.blockHeight
            ? `OpenTimestamps Bitcoin bloc ${upgraded.blockHeight}`
            : passport.proofExternalReference,
          updatedAt: new Date(),
        })
        .where(eq(workPassportsTable.id, passport.id));
      results.push({ id: passport.id, status: upgraded.status, blockHeight: upgraded.blockHeight ?? null });
    } catch (err) {
      req.log.warn({ err, passportId: passport.id }, "Echec upgrade OpenTimestamps");
      results.push({ id: passport.id, status: "error" });
    }
  }

  res.json({
    ok: true,
    checked: pendingPassports.length,
    results,
  });
});

router.post("/passport/verify-ots", async (req, res) => {
  const body = (req.body ?? {}) as { hash?: unknown; otsProof?: unknown };

  if (typeof body.hash !== "string" || typeof body.otsProof !== "string") {
    res.status(400).json({ error: "Empreinte ou preuve OpenTimestamps manquante" });
    return;
  }

  try {
    const valid = await verifyProof(body.otsProof, body.hash);
    res.json({ valid, blockchain: valid ? "bitcoin" : undefined });
  } catch (err) {
    req.log.warn({ err }, "Verification OpenTimestamps refusee");
    res.status(400).json({ valid: false, error: "Preuve OpenTimestamps invalide" });
  }
});

function sanitizeLimit(value: unknown): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw ?? 25);
  if (!Number.isFinite(parsed)) return 25;
  return Math.max(1, Math.min(100, Math.trunc(parsed)));
}

export default router;
