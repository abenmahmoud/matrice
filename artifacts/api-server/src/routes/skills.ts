import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { narrativeSkillsTable, projectSkillsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

// GET /api/skills
router.get("/skills", async (req, res) => {
  try {
    const skills = await db.select().from(narrativeSkillsTable)
      .orderBy(narrativeSkillsTable.createdAt);
    res.json(skills.reverse());
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/skills
router.post("/skills", async (req, res) => {
  try {
    const [skill] = await db.insert(narrativeSkillsTable)
      .values(req.body).returning();
    res.status(201).json(skill);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/skills/:id
router.put("/skills/:id", async (req, res) => {
  try {
    const [skill] = await db.update(narrativeSkillsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(narrativeSkillsTable.id, req.params.id))
      .returning();
    if (!skill) return res.status(404).json({ error: "Not found" });
    res.json(skill);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/skills/:id
router.delete("/skills/:id", async (req, res) => {
  try {
    await db.delete(narrativeSkillsTable)
      .where(eq(narrativeSkillsTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/projects/:id/skills
router.get("/projects/:id/skills", async (req, res) => {
  try {
    const rows = await db
      .select({ skill: narrativeSkillsTable })
      .from(projectSkillsTable)
      .innerJoin(narrativeSkillsTable, eq(projectSkillsTable.skillId, narrativeSkillsTable.id))
      .where(eq(projectSkillsTable.projectId, req.params.id));
    res.json(rows.map(r => r.skill));
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/projects/:id/skills/:skillId  — attach
router.post("/projects/:id/skills/:skillId", async (req, res) => {
  try {
    const existing = await db.select().from(projectSkillsTable).where(
      and(eq(projectSkillsTable.projectId, req.params.id), eq(projectSkillsTable.skillId, req.params.skillId))
    );
    if (existing.length > 0) return res.status(409).json({ error: "Already linked" });
    const [ps] = await db.insert(projectSkillsTable)
      .values({ projectId: req.params.id, skillId: req.params.skillId }).returning();
    res.status(201).json(ps);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/projects/:id/skills/:skillId  — detach
router.delete("/projects/:id/skills/:skillId", async (req, res) => {
  try {
    await db.delete(projectSkillsTable).where(
      and(eq(projectSkillsTable.projectId, req.params.id), eq(projectSkillsTable.skillId, req.params.skillId))
    );
    res.status(204).send();
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
