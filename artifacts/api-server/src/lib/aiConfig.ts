import { AsyncLocalStorage } from "node:async_hooks";
import type { NextFunction, Request, Response } from "express";
import { getProductAccess, type ProductPlan, type ViewerRole } from "./productAccess.js";

type AiAccessContext = {
  plan: ProductPlan;
  viewerRole: ViewerRole;
};

const aiAccessContext = new AsyncLocalStorage<AiAccessContext>();

function readModel(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return value || fallback;
}

export const defaultAiModel = process.env["AI_MODEL"] ?? "gpt-4o";

export function getAiModelForPlan(plan: ProductPlan, viewerRole: ViewerRole): string {
  if (viewerRole === "owner") {
    return readModel("AI_MODEL_OVERRIDE_OWNER", readModel("AI_MODEL_OWNER", defaultAiModel));
  }

  if (plan === "enterprise") {
    return readModel("AI_MODEL_ENTERPRISE", readModel("AI_MODEL_STUDIO", defaultAiModel));
  }

  if (plan === "studio") {
    return readModel("AI_MODEL_STUDIO", defaultAiModel);
  }

  if (plan === "pro") {
    return readModel("AI_MODEL_PRO", defaultAiModel);
  }

  return readModel("AI_MODEL_FREE", readModel("AI_MODEL_MINI", "gpt-4o-mini"));
}

export function getDefaultAiModel(): string {
  const context = aiAccessContext.getStore();
  if (!context) return defaultAiModel;
  return getAiModelForPlan(context.plan, context.viewerRole);
}

export function aiModelContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  void res;
  const access = getProductAccess(req);
  aiAccessContext.run({ plan: access.plan, viewerRole: access.viewer.role }, next);
}
