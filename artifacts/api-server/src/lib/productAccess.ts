import type { NextFunction, Request, Response } from "express";

export type ProductMode = "private" | "commercial";
export type ProductPlan = "private" | "free" | "pro";

export type ProductAccess = {
  mode: ProductMode;
  plan: ProductPlan;
  isPrivate: boolean;
  isPaid: boolean;
  limits: {
    freeProjectLimit: number;
    freeProgressionCap: number;
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

export function getProductAccess(): ProductAccess {
  const mode = readProductMode();
  const plan = readPlan();
  const isPrivate = mode === "private" || plan === "private";
  const isPaid = isPrivate || plan === "pro";

  return {
    mode,
    plan,
    isPrivate,
    isPaid,
    limits: {
      freeProjectLimit: Number(process.env["MATRICE_FREE_PROJECT_LIMIT"] ?? 1),
      freeProgressionCap: Number(process.env["MATRICE_FREE_PROGRESSION_CAP"] ?? 35),
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

function isAdvancedGeneration(req: Request): boolean {
  if (req.method !== "POST") return false;

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

export function productAccessMiddleware(req: Request, res: Response, next: NextFunction): void {
  const access = getProductAccess();

  if (access.isPaid || !isAdvancedGeneration(req)) {
    next();
    return;
  }

  res.status(402).json({
    error: "PAYWALL_REQUIRED",
    access,
  });
}
