import type { NextFunction, Request, Response } from "express";
import { getAuthUser } from "./auth.js";
import { generateAdminToken } from "../middleware/adminAuth.js";
import { ACTION_COSTS, getBalance, spendCredits } from "../services/creditsService.js";

export type ProductMode = "private" | "commercial";
export type ProductPlan = "private" | "free" | "pro" | "studio" | "premium" | "publish" | "enterprise";
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
  return process.env["MATRICE_PRODUCT_MODE"] === "private" ? "private" : "commercial";
}

function readPlan(): ProductPlan {
  const mode = readProductMode();
  if (mode === "private") return "private";
  const plan = process.env["MATRICE_DEFAULT_PLAN"];
  return plan === "pro" || plan === "studio" || plan === "premium" || plan === "publish" || plan === "enterprise"
    ? plan
    : "free";
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

  const userPlan: ProductPlan =
    user?.plan === "pro" ||
    user?.plan === "studio" ||
    user?.plan === "premium" ||
    user?.plan === "publish" ||
    user?.plan === "enterprise"
      ? user.plan
      : "free";
  const plan: ProductPlan = viewer.role === "owner" ? "private" : user ? userPlan : readPlan();
  const isPrivate = viewer.role === "owner";
  const isPaid =
    isPrivate || plan === "pro" || plan === "studio" || plan === "premium" || plan === "publish" || plan === "enterprise";

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

export async function productAccessMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const access = getProductAccess(req);

  if (access.mode === "commercial" && !access.viewer.authenticated) {
    res.status(401).json({ error: "AUTH_REQUIRED", access });
    return;
  }

  if (!isGenerationRequest(req)) {
    next();
    return;
  }

  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "AUTH_REQUIRED", access });
    return;
  }

  if (user.role === "owner" || user.role === "admin") {
    next();
    return;
  }

  const needed = ACTION_COSTS.generation;
  const balance = await getBalance(user.id);

  if (balance.total < needed) {
    res.status(402).json({ error: "INSUFFICIENT_CREDITS", needed, balance: balance.total });
    return;
  }

  res.once("finish", () => {
    if (res.statusCode < 200 || res.statusCode >= 400) return;

    void spendCredits(
      user.id,
      needed,
      "generation",
      JSON.stringify({ method: req.method, path: req.originalUrl }),
    )
      .then((result) => {
        if (!result.ok) {
          req.log.warn({ userId: user.id, path: req.originalUrl }, "Generation credit debit failed");
        }
      })
      .catch((err) => {
        req.log.warn({ err, userId: user.id, path: req.originalUrl }, "Generation credit debit errored");
      });
  });

  next();
}
