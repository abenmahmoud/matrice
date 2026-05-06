import type { NextFunction, Request, Response } from "express";
import { db, appUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getAuthUser } from "./auth.js";
import { generateAdminToken } from "../middleware/adminAuth.js";

export type ProductMode = "private" | "commercial";
export type ProductPlan = "private" | "free" | "pro";
export type ViewerRole = "owner" | "user" | "public";

export type ProductAccess = {
  mode: ProductMode;
  plan: ProductPlan;
  viewer: {
    role: ViewerRole;
    authenticated: boolean;
    source: "private-mode" | "admin-token" | "user-token" | "anonymous";
    userId?: string;
    email?: string;
  };
  isPrivate: boolean;
  isPaid: boolean;
  limits: {
    freeProjectLimit: number;
    freeProgressionCap: number;
    freeGenerationLimit: number;
    freeUnlockedModules: string[];
  };
  paywall: {
    title: string;
    message: string;
    cta: string;
  };
};

const freeUnlockedModules = ["matrix", "emotional-core"];

function readProductMode(): ProductMode {
  return process.env["MATRICE_PRODUCT_MODE"] === "commercial" ? "commercial" : "private";
}

function readPlan(): ProductPlan {
  const mode = readProductMode();
  if (mode === "private") return "private";
  return process.env["MATRICE_DEFAULT_PLAN"] === "pro" ? "pro" : "free";
}

function hasValidAdminToken(req?: Request): boolean {
  const adminPassword = process.env["ADMIN_PASSWORD"];
  const token = req?.headers["x-admin-token"] as string | undefined;

  if (!adminPassword || !token) return false;
  return token === generateAdminToken(adminPassword);
}

export function getProductAccess(req?: Request): ProductAccess {
  const mode = readProductMode();
  const isOwnerByPrivateMode = mode === "private";
  const isOwnerByAdminToken = hasValidAdminToken(req);
  const user = req ? getAuthUser(req) : null;
  const viewer: ProductAccess["viewer"] = isOwnerByPrivateMode
    ? { role: "owner", authenticated: true, source: "private-mode" }
    : isOwnerByAdminToken
      ? { role: "owner", authenticated: true, source: "admin-token" }
      : user
        ? {
          role: user.role === "owner" ? "owner" : "user",
          authenticated: true,
          source: "user-token",
          userId: user.id,
          email: user.email,
        }
        : { role: "public", authenticated: false, source: "anonymous" };

  const userPlan = user?.plan === "pro" ? "pro" : "free";
  const plan: ProductPlan = viewer.role === "owner" ? "private" : user ? userPlan : readPlan();
  const isPrivate = viewer.role === "owner";
  const isPaid = isPrivate || plan === "pro";

  return {
    mode,
    plan,
    viewer,
    isPrivate,
    isPaid,
    limits: {
      freeProjectLimit: Number(process.env["MATRICE_FREE_PROJECT_LIMIT"] ?? 1),
      freeProgressionCap: Number(process.env["MATRICE_FREE_PROGRESSION_CAP"] ?? 35),
      freeGenerationLimit: Number(process.env["MATRICE_FREE_GENERATION_LIMIT"] ?? 2),
      freeUnlockedModules,
    },
    paywall: {
      title: "Continuez avec Matrice Pro",
      message:
        "Vous avez atteint la partie avancée du parcours. Les fondations restent accessibles, les modules de structure, d'analyse et d'écriture sont réservés à l'abonnement.",
      cta: "Débloquer la suite",
    },
  };
}

export function isGenerationRequest(req: Request): boolean {
  if (req.method !== "POST") return false;

  const path = req.path;
  if (path === "/manuscripts/analyze") return true;
  if (!path.startsWith("/projects/")) return false;

  return (
    /^\/projects\/[^/]+\/generate-/.test(path) ||
    /^\/projects\/[^/]+\/director-mode$/.test(path) ||
    /^\/projects\/[^/]+\/characters\/[^/]+\/dialogue$/.test(path) ||
    /^\/projects\/[^/]+\/check-scene-hpsa$/.test(path)
  );
}

function isAdvancedGeneration(req: Request): boolean {
  if (!isGenerationRequest(req)) return false;

  const path = req.path;
  if (path === "/manuscripts/analyze") return true;
  if (!path.startsWith("/projects/")) return false;

  const freeGeneration = /^\/projects\/[^/]+\/generate-(matrix|emotional-core)$/.test(path);
  if (freeGeneration) return false;

  return (
    /^\/projects\/[^/]+\/generate-/.test(path) ||
    /^\/projects\/[^/]+\/director-mode$/.test(path) ||
    /^\/projects\/[^/]+\/characters\/[^/]+\/dialogue$/.test(path) ||
    /^\/projects\/[^/]+\/check-scene-hpsa$/.test(path)
  );
}

export async function productAccessMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const access = getProductAccess(req);

  if (access.mode === "commercial" && !access.viewer.authenticated) {
    res.status(401).json({ error: "AUTH_REQUIRED", access });
    return;
  }

  if (access.isPaid || !isGenerationRequest(req)) {
    next();
    return;
  }

  const user = getAuthUser(req);
  if (user && user.generationsUsed >= access.limits.freeGenerationLimit) {
    res.status(402).json({
      error: "FREE_GENERATION_LIMIT_REACHED",
      access,
    });
    return;
  }

  if (!isAdvancedGeneration(req)) {
    if (user) {
      await db
        .update(appUsersTable)
        .set({ generationsUsed: user.generationsUsed + 1, updatedAt: new Date() })
        .where(eq(appUsersTable.id, user.id));
    }
    next();
    return;
  }

  res.status(402).json({
    error: "PAYWALL_REQUIRED",
    access,
  });
}
