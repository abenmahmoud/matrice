import { Router, type IRouter, type NextFunction, type Request, type Response } from "express";
import { db, creativeMemoryEntriesTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { getProductAccess } from "../lib/productAccess.js";

const router: IRouter = Router();

function ownerOnly(req: Request, res: Response, next: NextFunction): void {
  const access = getProductAccess(req);
  if (access.viewer.role !== "owner") {
    res.status(403).json({ error: "ACCESS_FORBIDDEN", access });
    return;
  }
  next();
}

router.use(ownerOnly);

router.get("/", async (req, res) => {
  try {
    const entries = await db
      .select()
      .from(creativeMemoryEntriesTable)
      .orderBy(desc(creativeMemoryEntriesTable.priority), desc(creativeMemoryEntriesTable.updatedAt));
    res.json(entries);
  } catch (err) {
    req.log.error({ err }, "Failed to list creative memory entries");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = req.body as {
      category?: string;
      title?: string;
      content?: string;
      tags?: string[];
      priority?: number;
      isActive?: boolean;
    };
    if (!body.category || !body.title) {
      res.status(400).json({ error: "category and title are required" });
      return;
    }

    const [entry] = await db
      .insert(creativeMemoryEntriesTable)
      .values({
        category: body.category,
        title: body.title,
        content: body.content ?? "",
        tags: body.tags ?? [],
        priority: body.priority ?? 50,
        isActive: body.isActive ?? true,
      })
      .returning();
    res.status(201).json(entry);
  } catch (err) {
    req.log.error({ err }, "Failed to create creative memory entry");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const [entry] = await db
      .update(creativeMemoryEntriesTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(creativeMemoryEntriesTable.id, req.params.id))
      .returning();
    if (!entry) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(entry);
  } catch (err) {
    req.log.error({ err }, "Failed to update creative memory entry");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(creativeMemoryEntriesTable).where(eq(creativeMemoryEntriesTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete creative memory entry");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
