import { Router, type IRouter } from "express";
import { db, appUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { adminAuthMiddleware } from "../middleware/adminAuth.js";
import { generateAdminToken } from "../middleware/adminAuth.js";

const router: IRouter = Router();

// POST /api/admin/login
router.post("/admin/login", (req, res) => {
  const { password } = req.body as { password?: string };
  const adminPassword = process.env["ADMIN_PASSWORD"];

  if (!adminPassword) {
    res.status(503).json({ error: "ADMIN_PASSWORD non configuré — définissez-le dans les secrets d'environnement" });
    return;
  }
  if (!password || password !== adminPassword) {
    res.status(401).json({ error: "Mot de passe incorrect" });
    return;
  }

  const token = generateAdminToken(password);
  res.json({ token });
});

// GET /api/admin/verify
router.get("/admin/verify", (req, res) => {
  const adminPassword = process.env["ADMIN_PASSWORD"];
  if (!adminPassword) { res.status(503).json({ configured: false }); return; }

  const token = req.headers["x-admin-token"] as string | undefined;
  if (!token) { res.status(401).json({ valid: false }); return; }

  const expected = generateAdminToken(adminPassword);
  res.json({ valid: token === expected });
});

router.get("/admin/subscriptions/users", adminAuthMiddleware, async (req, res) => {
  try {
    const users = await db
      .select({
        id: appUsersTable.id,
        email: appUsersTable.email,
        displayName: appUsersTable.displayName,
        role: appUsersTable.role,
        plan: appUsersTable.plan,
        status: appUsersTable.status,
        generationsUsed: appUsersTable.generationsUsed,
        projectsCreated: appUsersTable.projectsCreated,
        stripeCustomerId: appUsersTable.stripeCustomerId,
        stripeSubscriptionId: appUsersTable.stripeSubscriptionId,
        createdAt: appUsersTable.createdAt,
        updatedAt: appUsersTable.updatedAt,
      })
      .from(appUsersTable);
    res.json(users);
  } catch (err) {
    req.log.error({ err }, "Failed to list subscription users");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/subscriptions/users/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const body = req.body as {
      plan?: "free" | "pro" | "studio" | "publish" | "enterprise";
      role?: "user" | "owner";
      status?: "active" | "suspended";
      resetUsage?: boolean;
    };

    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (body.plan === "free" || body.plan === "pro" || body.plan === "studio" || body.plan === "publish" || body.plan === "enterprise") {
      patch["plan"] = body.plan;
    }
    if (body.role === "user" || body.role === "owner") patch["role"] = body.role;
    if (body.status === "active" || body.status === "suspended") patch["status"] = body.status;
    if (body.resetUsage) {
      patch["generationsUsed"] = 0;
      patch["projectsCreated"] = 0;
    }

    const userId = String(req.params.id);
    const [user] = await db.update(appUsersTable).set(patch).where(eq(appUsersTable.id, userId)).returning();
    if (!user) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      plan: user.plan,
      status: user.status,
      generationsUsed: user.generationsUsed,
      projectsCreated: user.projectsCreated,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update subscription user");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
