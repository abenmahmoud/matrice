import { Router, type IRouter, type NextFunction, type Request, type Response } from "express";
import QRCode from "qrcode";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { appUsersTable, db, projectsTable, workPassportsTable } from "@workspace/db";
import { getAuthUser } from "../lib/auth.js";
import { resolveExportAuthorName } from "../services/authorDisplayNameService.js";

const router: IRouter = Router();
const HASH_RE = /^[a-f0-9]{64}$/i;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 100;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

type PublicVerifyPassport = typeof workPassportsTable.$inferSelect;

router.get("/public/verify/:hash", rateLimitPublic, async (req, res) => {
  const hash = normalizeHash(req.params["hash"]);

  if (!hash) {
    res.status(400).json({ error: "Format de hash invalide" });
    return;
  }

  const passport = await findPassportByHash(hash);
  if (!passport?.sealedAt) {
    res.status(404).json({
      found: false,
      message: "Aucun passeport d'œuvre trouvé pour ce hash",
    });
    return;
  }

  res.set("Cache-Control", "public, max-age=300");
  res.json(await toPublicVerifyPayload(passport, hash));
});

router.get("/public/verify/:hash/qr.png", rateLimitPublic, async (req, res) => {
  const hash = normalizeHash(req.params["hash"]);
  const size = sanitizeImageSize(req.query["size"], 512);

  if (!hash) {
    res.status(400).json({ error: "Format de hash invalide" });
    return;
  }

  const passport = await findPassportByHash(hash);
  if (!passport?.sealedAt) {
    res.status(404).json({ error: "Passeport d'œuvre introuvable" });
    return;
  }

  const qrBuffer = await QRCode.toBuffer(verifyUrl(hash), {
    type: "png",
    width: size,
    margin: 2,
    errorCorrectionLevel: "H",
    color: {
      dark: "#0B0B0D",
      light: "#EDEBE6",
    },
  });

  res.set("Content-Type", "image/png");
  res.set("Cache-Control", "public, max-age=86400");
  res.send(qrBuffer);
});

router.get("/public/verify/:hash/badge.svg", rateLimitPublic, async (req, res) => {
  const hash = normalizeHash(req.params["hash"]);
  const size = sanitizeBadgeSize(req.query["size"]);

  if (!hash) {
    res.status(400).type("text/plain").send("Format de hash invalide");
    return;
  }

  const passport = await findPassportByHash(hash);
  if (!passport?.sealedAt) {
    res.status(404).type("text/plain").send("Passeport d'œuvre introuvable");
    return;
  }

  res.set("Content-Type", "image/svg+xml; charset=utf-8");
  res.set("Cache-Control", "public, max-age=86400");
  res.send(renderVerifyBadgeSvg({ size, confirmed: passport.otsStatus === "confirmed" }));
});

router.get("/passport/locked-works", async (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "AUTH_REQUIRED" });
    return;
  }

  const passports = await db
    .select()
    .from(workPassportsTable)
    .where(and(eq(workPassportsTable.ownerUserId, user.id), isNotNull(workPassportsTable.sealedAt)))
    .orderBy(desc(workPassportsTable.sealedAt))
    .limit(100);

  res.json({
    works: await Promise.all(passports
      .filter((passport) => passport.contentHash)
      .map(async (passport) => ({
        id: passport.id,
        projectId: passport.projectId,
        title: passport.officialTitle || "Œuvre sans titre",
        author: await displayAuthor(passport),
        workType: passport.workType,
        sealedAt: passport.sealedAt,
        contentHash: passport.contentHash,
        otsStatus: passport.otsStatus,
        otsBlockHeight: passport.otsBlockHeight,
        verifyUrl: verifyUrl(passport.contentHash as string),
        qrUrl: `/api/public/verify/${passport.contentHash}/qr.png?size=512`,
        badgeUrl: `/api/public/verify/${passport.contentHash}/badge.svg?size=md`,
        passportUrl: `/projects/${passport.projectId}/passport`,
      }))),
  });
});

function rateLimitPublic(req: Request, res: Response, next: NextFunction): void {
  cleanupRateLimitStore();

  const key = clientIp(req);
  const now = Date.now();
  const current = rateLimitStore.get(key);
  const bucket = current && current.resetAt > now
    ? { count: current.count + 1, resetAt: current.resetAt }
    : { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };

  rateLimitStore.set(key, bucket);

  const remaining = Math.max(0, RATE_LIMIT_MAX - bucket.count);
  res.set("X-RateLimit-Limit", String(RATE_LIMIT_MAX));
  res.set("X-RateLimit-Remaining", String(remaining));
  res.set("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count > RATE_LIMIT_MAX) {
    res.set("Retry-After", String(Math.ceil((bucket.resetAt - now) / 1000)));
    res.status(429).json({ error: "Trop de requetes de verification. Reessayez plus tard." });
    return;
  }

  next();
}

function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, value] of rateLimitStore) {
    if (value.resetAt <= now) rateLimitStore.delete(key);
  }
}

function clientIp(req: Request): string {
  const forwarded = req.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.ip || req.socket.remoteAddress || "unknown";
}

function normalizeHash(value: unknown): string | null {
  const hash = Array.isArray(value) ? value[0] : value;
  if (typeof hash !== "string" || !HASH_RE.test(hash)) return null;
  return hash.toLowerCase();
}

async function findPassportByHash(hash: string): Promise<PublicVerifyPassport | null> {
  const [passport] = await db
    .select()
    .from(workPassportsTable)
    .where(eq(workPassportsTable.contentHash, hash))
    .limit(1);
  return passport ?? null;
}

async function toPublicVerifyPayload(passport: PublicVerifyPassport, hash: string) {
  return {
    found: true,
    title: passport.officialTitle,
    author: await displayAuthor(passport),
    workType: passport.workType,
    language: passport.language,
    sealedAt: passport.sealedAt,
    contentHash: passport.contentHash,
    otsStatus: passport.otsStatus,
    otsBlockchain: passport.otsBlockchain,
    otsBlockHeight: passport.otsBlockHeight,
    otsConfirmedAt: passport.otsConfirmedAt,
    verifyUrl: verifyUrl(hash),
    proofProvider: passport.proofProvider,
  };
}

async function displayAuthor(passport: PublicVerifyPassport): Promise<string> {
  const [project] = await db
    .select({ authorDisplayName: projectsTable.authorDisplayName })
    .from(projectsTable)
    .where(eq(projectsTable.id, passport.projectId))
    .limit(1);

  const [owner] = await db
    .select({ email: appUsersTable.email, displayName: appUsersTable.displayName })
    .from(appUsersTable)
    .where(eq(appUsersTable.id, passport.ownerUserId))
    .limit(1);

  return resolveExportAuthorName({
    pseudonym: passport.pseudonym,
    passportDisplayedAuthor: passport.displayedAuthor,
    projectAuthorDisplayName: project?.authorDisplayName,
    userDisplayName: owner?.displayName,
    userEmail: owner?.email,
  });
}

function verifyUrl(hash: string): string {
  return `${publicBaseUrl()}/verify/${hash}`;
}

function publicBaseUrl(): string {
  return (process.env["MATRICE_PUBLIC_BASE_URL"] || "https://matrice.essuf.fr").replace(/\/$/, "");
}

function sanitizeImageSize(value: unknown, fallback: number): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw ?? fallback);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(128, Math.min(1024, Math.trunc(parsed)));
}

function sanitizeBadgeSize(value: unknown): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "sm") return 24;
  if (raw === "lg") return 96;
  if (raw === "xl") return 192;
  if (raw === "md" || raw === undefined) return 48;
  return sanitizeImageSize(raw, 48);
}

function renderVerifyBadgeSvg({ size, confirmed }: { size: number; confirmed: boolean }): string {
  const center = 96;
  const icon = confirmed
    ? `<path d="M70 99l17 17 36-42" fill="none" stroke="#C9A961" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<path d="M96 62l30 17v30c0 19-13 35-30 42-17-7-30-23-30-42V79l30-17z" fill="none" stroke="#C9A961" stroke-width="8" stroke-linejoin="round"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 192 192" role="img" aria-label="Matrice Certified">
  <rect width="192" height="192" rx="96" fill="#0B0B0D"/>
  <circle cx="${center}" cy="${center}" r="84" fill="none" stroke="#C9A961" stroke-width="5"/>
  <circle cx="${center}" cy="${center}" r="68" fill="none" stroke="#C9A961" stroke-opacity=".35" stroke-width="1.5"/>
  <text x="96" y="47" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="21" font-weight="700" letter-spacing="5" fill="#EDEBE6">MATRICE</text>
  ${icon}
  <text x="96" y="153" text-anchor="middle" font-family="Manrope, Inter, Arial, sans-serif" font-size="15" font-weight="800" letter-spacing="3" fill="#C9A961">CERTIFIED</text>
  <text x="96" y="171" text-anchor="middle" font-family="Manrope, Inter, Arial, sans-serif" font-size="8" letter-spacing="1.5" fill="#EDEBE6" opacity=".68">PASSEPORT D'ŒUVRE</text>
</svg>`;
}

export default router;
