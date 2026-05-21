import { Router, type IRouter } from "express";
import { db, experimentalModulesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getProductAccess } from "../lib/productAccess.js";

const router: IRouter = Router();

const PLAN_RANK: Record<string, number> = {
  free: 0,
  pro: 1,
  studio: 2,
  publish: 3,
  enterprise: 4,
  private: 99,
};

function canUseModule(input: {
  viewerRole: string;
  currentPlan: string;
  minimumPlan: string;
  isOwnerOnly: boolean;
  isEnabled: boolean;
}) {
  if (!input.isEnabled) return false;
  if (input.viewerRole === "owner") return true;
  if (input.isOwnerOnly) return false;
  return (PLAN_RANK[input.currentPlan] ?? 0) >= (PLAN_RANK[input.minimumPlan] ?? 2);
}

function normalizeSlug(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

router.get("/experimental-modules", async (req, res) => {
  try {
    const access = getProductAccess(req);
    const modules = await db.select().from(experimentalModulesTable).orderBy(experimentalModulesTable.createdAt);

    res.json({
      modules: modules.map((module) => ({
        ...module,
        available: canUseModule({
          viewerRole: access.viewer.role,
          currentPlan: access.plan,
          minimumPlan: module.minimumPlan,
          isOwnerOnly: module.isOwnerOnly,
          isEnabled: module.isEnabled,
        }),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list experimental modules");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/experimental-modules", async (req, res) => {
  try {
    const access = getProductAccess(req);
    if (access.viewer.role !== "owner") {
      res.status(403).json({ error: "OWNER_REQUIRED", access });
      return;
    }

    const body = req.body as {
      slug?: string;
      name?: string;
      description?: string;
      minimumPlan?: string;
      isOwnerOnly?: boolean;
      isEnabled?: boolean;
    };
    const slug = normalizeSlug(body.slug ?? body.name ?? "");
    if (!slug || !body.name?.trim()) {
      res.status(400).json({ error: "SLUG_AND_NAME_REQUIRED" });
      return;
    }

    const [module] = await db
      .insert(experimentalModulesTable)
      .values({
        slug,
        name: body.name.trim(),
        description: body.description?.trim() ?? "",
        minimumPlan: body.minimumPlan ?? "studio",
        isOwnerOnly: body.isOwnerOnly ?? false,
        isEnabled: body.isEnabled ?? true,
      })
      .returning();

    res.status(201).json({ module });
  } catch (err) {
    req.log.error({ err }, "Failed to create experimental module");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/experimental-modules/:id", async (req, res) => {
  try {
    const access = getProductAccess(req);
    if (access.viewer.role !== "owner") {
      res.status(403).json({ error: "OWNER_REQUIRED", access });
      return;
    }

    const body = req.body as {
      name?: string;
      description?: string;
      minimumPlan?: string;
      isOwnerOnly?: boolean;
      isEnabled?: boolean;
    };

    const [module] = await db
      .update(experimentalModulesTable)
      .set({
        ...(body.name !== undefined ? { name: body.name.trim() } : {}),
        ...(body.description !== undefined ? { description: body.description.trim() } : {}),
        ...(body.minimumPlan !== undefined ? { minimumPlan: body.minimumPlan } : {}),
        ...(body.isOwnerOnly !== undefined ? { isOwnerOnly: body.isOwnerOnly } : {}),
        ...(body.isEnabled !== undefined ? { isEnabled: body.isEnabled } : {}),
        updatedAt: new Date(),
      })
      .where(eq(experimentalModulesTable.id, req.params.id))
      .returning();

    if (!module) {
      res.status(404).json({ error: "MODULE_NOT_FOUND" });
      return;
    }

    res.json({ module });
  } catch (err) {
    req.log.error({ err }, "Failed to update experimental module");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
