import { createHmac, timingSafeEqual } from "node:crypto";
import { Router, type Request, type Response } from "express";
import { and, desc, eq, inArray } from "drizzle-orm";
import {
  appUsersTable,
  db,
  delegationMandateTable,
  projectsTable,
  type DelegationMandate,
  type MandateLevel,
} from "@workspace/db";
import { getAuthUser, type AuthenticatedUser } from "../lib/auth.js";
import { createMandateEnvelope, EssufSignNotConfiguredError } from "../services/essufSignClient.js";
import { generateMandatePdf } from "../services/mandatePdfService.js";

const router = Router();

const ACTIVE_STATUSES = ["draft", "pending_signature", "active"] as const;
const LEVELS = ["simple", "advanced", "exclusive"] as const;
const ALLOWED_PLANS = new Set(["studio", "premium", "publish", "enterprise"]);

type MandateInput = {
  level: MandateLevel;
  commissionPercent: number;
  durationMonths: number;
  territories: string[];
  exclusivity: boolean;
};

function requireAuth(req: Request, res: Response): AuthenticatedUser | null {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "AUTH_REQUIRED" });
    return null;
  }
  return user;
}

function canUseMandates(user: AuthenticatedUser): boolean {
  return user.role === "owner" || user.role === "admin" || ALLOWED_PLANS.has(user.plan);
}

function parseMandateInput(body: unknown): { ok: true; input: MandateInput } | { ok: false; details: Array<{ path: string; message: string }> } {
  const data = typeof body === "object" && body !== null ? body as Record<string, unknown> : {};
  const details: Array<{ path: string; message: string }> = [];

  const rawLevel = typeof data["level"] === "string" ? data["level"] : "advanced";
  const level = LEVELS.includes(rawLevel as MandateLevel) ? rawLevel as MandateLevel : "advanced";
  const commissionPercent = Number(data["commission_percent"] ?? 15);
  const durationMonths = Number(data["duration_months"] ?? 12);
  const exclusivity = Boolean(data["exclusivity"]);
  const territories = Array.isArray(data["territories"])
    ? data["territories"].map((item) => String(item ?? "").trim()).filter(Boolean).slice(0, 12)
    : ["monde"];

  if (!Number.isInteger(commissionPercent) || commissionPercent < 5 || commissionPercent > 30) {
    details.push({ path: "commission_percent", message: "La commission doit etre comprise entre 5 et 30%." });
  }
  if (!Number.isInteger(durationMonths) || durationMonths < 6 || durationMonths > 36) {
    details.push({ path: "duration_months", message: "La duree doit etre comprise entre 6 et 36 mois." });
  }
  if (territories.length === 0) {
    details.push({ path: "territories", message: "Au moins un territoire est requis." });
  }

  if (details.length > 0) return { ok: false, details };
  return { ok: true, input: { level, commissionPercent, durationMonths, territories, exclusivity } };
}

async function loadOwnedProject(projectId: string, user: AuthenticatedUser) {
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, projectId)).limit(1);
  if (!project) return null;
  if (user.role === "owner" || user.role === "admin" || project.ownerUserId === user.id) return project;
  return null;
}

function publicBaseUrl(): string {
  return (process.env["MATRICE_BASE_URL"] ?? process.env["MATRICE_PUBLIC_BASE_URL"] ?? "https://matrice.essuf.fr").replace(/\/$/, "");
}

function mandataireEmail(): string {
  return process.env["ESSUF_MANDATAIRE_EMAIL"] ?? "am.ad.bm@gmail.com";
}

router.post("/projects/:projectId/mandate", async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;
    if (!canUseMandates(user)) {
      res.status(403).json({ error: "PLAN_UPGRADE_REQUIRED", required_plan: "studio" });
      return;
    }

    const projectId = req.params["projectId"] ?? "";
    const project = await loadOwnedProject(projectId, user);
    if (!project) {
      res.status(404).json({ error: "PROJECT_NOT_FOUND" });
      return;
    }

    const validation = parseMandateInput(req.body);
    if (!validation.ok) {
      res.status(400).json({ error: "INVALID_INPUT", details: validation.details });
      return;
    }

    const [existing] = await db
      .select()
      .from(delegationMandateTable)
      .where(and(
        eq(delegationMandateTable.projectId, project.id),
        inArray(delegationMandateTable.status, [...ACTIVE_STATUSES]),
      ))
      .limit(1);

    if (existing) {
      res.status(409).json({ error: "MANDATE_ALREADY_EXISTS", id: existing.id, status: existing.status });
      return;
    }

    const [mandate] = await db.insert(delegationMandateTable).values({
      userId: user.id,
      projectId: project.id,
      mandateLevel: validation.input.level,
      commissionPercent: validation.input.commissionPercent,
      durationMonths: validation.input.durationMonths,
      territories: validation.input.territories,
      exclusivity: validation.input.exclusivity,
      status: "draft",
    }).returning();

    res.status(201).json({ mandate });
  } catch (err) {
    req.log.error({ err }, "Mandate creation failed");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/mandates/:id/send-for-signature", async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    const mandate = await loadUserMandate(req.params["id"] ?? "", user);
    if (!mandate) {
      res.status(404).json({ error: "NOT_FOUND" });
      return;
    }
    if (mandate.status !== "draft") {
      res.status(409).json({ error: "MANDATE_NOT_DRAFT", status: mandate.status });
      return;
    }

    const project = await loadOwnedProject(mandate.projectId, user);
    if (!project) {
      res.status(404).json({ error: "PROJECT_NOT_FOUND" });
      return;
    }

    const [userRow] = await db.select().from(appUsersTable).where(eq(appUsersTable.id, mandate.userId)).limit(1);
    if (!userRow) {
      res.status(404).json({ error: "USER_NOT_FOUND" });
      return;
    }

    const webhookSecret = process.env["ESSUF_SIGN_WEBHOOK_SECRET"] ?? "";
    const pdfBuffer = await generateMandatePdf({
      level: mandate.mandateLevel,
      commissionPercent: mandate.commissionPercent,
      durationMonths: mandate.durationMonths,
      territories: mandate.territories,
      exclusivity: mandate.exclusivity,
      author: {
        fullName: userRow.displayName || userRow.email,
        email: userRow.email,
      },
      project: {
        title: project.title || "Oeuvre sans titre",
        pitch: project.rawIdea || project.manuscriptExcerpt || "",
        genre: project.genre || "Indetermine",
      },
      mandataire: {
        name: "ESSUF-GROUP SAS",
        siret: process.env["ESSUF_SIRET"] ?? "En cours d'immatriculation",
        representative: process.env["ESSUF_REPRESENTATIVE"] ?? "Adel BENMAHMOUD, President",
        address: process.env["ESSUF_ADDRESS"] ?? "Drancy, France",
      },
    });

    const envelope = await createMandateEnvelope({
      mandateId: mandate.id,
      projectId: mandate.projectId,
      documentName: `Mandat ${project.title || mandate.id}`,
      pdfBuffer,
      signers: [
        { name: userRow.displayName || userRow.email, email: userRow.email, role: "author", signOrder: 1 },
        { name: process.env["ESSUF_MANDATAIRE_NAME"] ?? "Adel BENMAHMOUD", email: mandataireEmail(), role: "mandataire", signOrder: 2 },
      ],
      webhookUrl: `${publicBaseUrl()}/api/mandates/webhook`,
      webhookSecret,
      expiresInDays: 30,
      metadata: { user_id: user.id },
    });

    const [updated] = await db
      .update(delegationMandateTable)
      .set({
        status: "pending_signature",
        essufSignEnvelopeId: envelope.envelopeId,
        authorSignUrl: envelope.signersLinks[userRow.email] ?? null,
        updatedAt: new Date(),
      })
      .where(eq(delegationMandateTable.id, mandate.id))
      .returning();

    res.json({
      mandate: updated,
      envelope_id: envelope.envelopeId,
      author_sign_url: envelope.signersLinks[userRow.email] ?? null,
      pdf_original_hash: envelope.pdfOriginalHash,
    });
  } catch (err) {
    if (err instanceof EssufSignNotConfiguredError) {
      res.status(503).json({ error: "ESSUF_SIGN_NOT_CONFIGURED" });
      return;
    }
    req.log.error({ err }, "Mandate send for signature failed");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/mandates/webhook", async (req, res) => {
  try {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body ?? {}));
    if (!verifyWebhookSignature(rawBody, req.get("X-Essuf-Sign-Signature"))) {
      res.status(401).json({ error: "INVALID_SIGNATURE" });
      return;
    }

    const event = JSON.parse(rawBody.toString("utf8")) as {
      envelope_id?: string;
      status?: string;
      signed_at?: string;
      final_pdf_hash?: string | null;
      pdf_signed_hash?: string | null;
      ots_hash?: string | null;
      verify_url?: string | null;
    };

    if (!event.envelope_id || !event.status) {
      res.status(400).json({ error: "INVALID_EVENT" });
      return;
    }

    const [mandate] = await db
      .select()
      .from(delegationMandateTable)
      .where(eq(delegationMandateTable.essufSignEnvelopeId, event.envelope_id))
      .limit(1);

    if (!mandate) {
      res.status(404).json({ error: "MANDATE_NOT_FOUND" });
      return;
    }

    const eventDate = event.signed_at ? new Date(event.signed_at) : new Date();
    if (event.status === "completed" || event.status === "signed") {
      const hash = event.final_pdf_hash ?? event.pdf_signed_hash ?? null;
      await db.update(delegationMandateTable).set({
        status: "active",
        finalPdfHash: hash,
        otsHash: event.ots_hash ?? hash,
        verifyUrl: event.verify_url ?? (hash ? `${(process.env["ESSUF_SIGN_BASE_URL"] ?? "https://sign.essuf.fr").replace(/\/$/, "")}/verify/${hash}` : null),
        signedAt: eventDate,
        updatedAt: new Date(),
      }).where(eq(delegationMandateTable.id, mandate.id));
    } else if (event.status === "declined") {
      await db.update(delegationMandateTable).set({
        status: "declined",
        declinedAt: eventDate,
        updatedAt: new Date(),
      }).where(eq(delegationMandateTable.id, mandate.id));
    } else if (event.status === "expired") {
      await db.update(delegationMandateTable).set({
        status: "expired",
        expiredAt: eventDate,
        updatedAt: new Date(),
      }).where(eq(delegationMandateTable.id, mandate.id));
    }

    res.json({ received: true });
  } catch (err) {
    req.log.error({ err }, "Mandate webhook failed");
    res.status(400).json({ error: "INVALID_WEBHOOK" });
  }
});

router.get("/projects/:projectId/mandate", async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    const project = await loadOwnedProject(req.params["projectId"] ?? "", user);
    if (!project) {
      res.status(404).json({ error: "PROJECT_NOT_FOUND" });
      return;
    }

    const [mandate] = await db
      .select()
      .from(delegationMandateTable)
      .where(and(eq(delegationMandateTable.projectId, project.id), eq(delegationMandateTable.userId, user.id)))
      .orderBy(desc(delegationMandateTable.createdAt))
      .limit(1);

    if (!mandate) {
      res.status(404).json({ error: "NOT_FOUND" });
      return;
    }

    res.json({ mandate });
  } catch (err) {
    req.log.error({ err }, "Mandate load failed");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

async function loadUserMandate(id: string, user: AuthenticatedUser): Promise<DelegationMandate | null> {
  const [mandate] = await db.select().from(delegationMandateTable).where(eq(delegationMandateTable.id, id)).limit(1);
  if (!mandate) return null;
  if (user.role === "owner" || user.role === "admin" || mandate.userId === user.id) return mandate;
  return null;
}

function verifyWebhookSignature(rawBody: Buffer, signature: string | undefined): boolean {
  const secret = process.env["ESSUF_SIGN_WEBHOOK_SECRET"];
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(signature, "hex");
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

export default router;
