import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { researchEntriesTable, knowledgeDossiersTable, narrativeSkillsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  generateResearchEntry, selectDailyTarget,
  ERAS, CULTURES, MEDIUMS
} from "../services/researchLabService.js";

const router: IRouter = Router();

// SSE helper (same pattern as projects.ts)
async function sseRun(req: Request, res: Response, steps: [string, string, string], work: () => Promise<unknown>): Promise<void> {
  const isSSE = (req.headers["accept"] ?? "").includes("text/event-stream");
  const send = (e: Record<string, unknown>) => { if (isSSE) res.write(`data: ${JSON.stringify(e)}\n\n`); };
  if (isSSE) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    send({ type: "progress", step: steps[0], percent: 8 });
  }
  try {
    send({ type: "progress", step: steps[1], percent: 30 });
    const result = await work();
    send({ type: "progress", step: steps[2], percent: 92 });
    if (isSSE) { send({ type: "done", data: result }); res.end(); }
    else res.json(result);
  } catch (err) {
    if (isSSE) { send({ type: "error", message: "Erreur de génération IA" }); res.end(); }
    else throw err;
  }
}

// GET /api/research-lab/taxonomy
router.get("/research-lab/taxonomy", (_req, res) => {
  res.json({ eras: ERAS, cultures: CULTURES, mediums: MEDIUMS });
});

// GET /api/research-lab/entries
router.get("/research-lab/entries", async (req, res) => {
  try {
    const entries = await db.select().from(researchEntriesTable).orderBy(researchEntriesTable.createdAt);
    res.json(entries.reverse());
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/research-lab/entries/:id
router.get("/research-lab/entries/:id", async (req, res) => {
  try {
    const [entry] = await db.select().from(researchEntriesTable).where(eq(researchEntriesTable.id, req.params.id));
    if (!entry) return res.status(404).json({ error: "Not found" });
    res.json(entry);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/research-lab/entries/:id
router.delete("/research-lab/entries/:id", async (req, res) => {
  try {
    await db.delete(researchEntriesTable).where(eq(researchEntriesTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/research-lab/generate  — generate with specified era/culture/medium
router.post("/research-lab/generate", (req, res) => {
  void (async () => {
    try {
      const { era: eraKey, culture: cultureKey, medium: mediumKey } = req.body as { era: string; culture: string; medium: string };
      if (!eraKey || !cultureKey || !mediumKey) { res.status(400).json({ error: "era, culture, medium required" }); return; }

      const eraObj = ERAS.find(e => e.key === eraKey);
      const cultureObj = CULTURES.find(c => c.key === cultureKey);

      await sseRun(req, res,
        ["Initialisation de la recherche...", `Analyse de la tradition ${cultureObj?.label ?? cultureKey} — ${eraObj?.label ?? eraKey}...`, "Extraction des skills narratifs..."],
        async () => {
          const data = await generateResearchEntry(eraKey, cultureKey, mediumKey);

          // Save research entry
          const [entry] = await db.insert(researchEntriesTable).values({
            title: data.title,
            era: eraKey,
            eraLabel: eraObj?.label ?? eraKey,
            eraStart: eraObj?.start,
            eraEnd: eraObj?.end,
            culture: cultureKey,
            cultureLabel: cultureObj?.label ?? cultureKey,
            medium: mediumKey,
            summary: data.summary,
            keyTechniques: data.keyTechniques,
            emotionalPrinciples: data.emotionalPrinciples,
            culturalContext: data.culturalContext,
            notableWorks: data.notableWorks,
            narrativeLessons: data.narrativeLessons,
            skillsExtracted: data.extractedSkills.length > 0,
            extractedSkillIds: [],
          }).returning();

          // Save extracted skills as narrative_skills
          const skillIds: string[] = [];
          if (data.extractedSkills.length > 0) {
            for (const sk of data.extractedSkills) {
              const [saved] = await db.insert(narrativeSkillsTable).values({
                name: sk.name,
                description: sk.description,
                category: sk.category,
                promptContent: sk.promptContent,
                isActive: false, // secret skills — inactive by default, user activates manually
                isGlobal: true,
              }).returning();
              skillIds.push(saved.id);
            }
            await db.update(researchEntriesTable)
              .set({ extractedSkillIds: skillIds })
              .where(eq(researchEntriesTable.id, entry.id));
          }

          return { ...entry, extractedSkillIds: skillIds, skills: data.extractedSkills };
        }
      );
    } catch (err) {
      req.log.error({ err });
      if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
  })();
});

// POST /api/research-lab/daily  — auto-pick gap and generate
router.post("/research-lab/daily", (req, res) => {
  void (async () => {
    try {
      const existing = await db.select({
        era: researchEntriesTable.era,
        culture: researchEntriesTable.culture
      }).from(researchEntriesTable);

      const target = selectDailyTarget(existing);
      const eraObj = ERAS.find(e => e.key === target.era);
      const cultureObj = CULTURES.find(c => c.key === target.culture);

      await sseRun(req, res,
        ["Analyse des lacunes de la bibliothèque...", `Exploration : ${cultureObj?.label ?? target.culture} — ${eraObj?.label ?? target.era}...`, "Extraction des skills secrets..."],
        async () => {
          const data = await generateResearchEntry(target.era, target.culture, target.medium);

          const [entry] = await db.insert(researchEntriesTable).values({
            title: data.title,
            era: target.era,
            eraLabel: eraObj?.label ?? target.era,
            eraStart: eraObj?.start,
            eraEnd: eraObj?.end,
            culture: target.culture,
            cultureLabel: cultureObj?.label ?? target.culture,
            medium: target.medium,
            summary: data.summary,
            keyTechniques: data.keyTechniques,
            emotionalPrinciples: data.emotionalPrinciples,
            culturalContext: data.culturalContext,
            notableWorks: data.notableWorks,
            narrativeLessons: data.narrativeLessons,
            skillsExtracted: data.extractedSkills.length > 0,
            extractedSkillIds: [],
          }).returning();

          const skillIds: string[] = [];
          for (const sk of data.extractedSkills) {
            const [saved] = await db.insert(narrativeSkillsTable).values({
              name: sk.name,
              description: sk.description,
              category: sk.category,
              promptContent: sk.promptContent,
              isActive: false,
              isGlobal: true,
            }).returning();
            skillIds.push(saved.id);
          }
          if (skillIds.length > 0) {
            await db.update(researchEntriesTable).set({ extractedSkillIds: skillIds }).where(eq(researchEntriesTable.id, entry.id));
          }

          return { ...entry, extractedSkillIds: skillIds, skills: data.extractedSkills, target };
        }
      );
    } catch (err) {
      req.log.error({ err });
      if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
  })();
});

// GET /api/research-lab/stats
router.get("/research-lab/stats", async (req, res) => {
  try {
    const entries = await db.select().from(researchEntriesTable);
    const cultures = new Set(entries.map(e => e.culture));
    const eras = new Set(entries.map(e => e.era));
    const totalSkills = entries.reduce((sum, e) => sum + (e.extractedSkillIds as string[]).length, 0);

    const coverageMatrix: Record<string, Record<string, boolean>> = {};
    for (const e of entries) {
      if (!coverageMatrix[e.era]) coverageMatrix[e.era] = {};
      coverageMatrix[e.era][e.culture] = true;
    }

    res.json({
      totalEntries: entries.length,
      culturesExplored: cultures.size,
      erasExplored: eras.size,
      totalSkillsExtracted: totalSkills,
      coverageMatrix,
      totalPossible: ERAS.length * CULTURES.length,
    });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/research-lab/dossiers
router.get("/research-lab/dossiers", async (req, res) => {
  try {
    const dossiers = await db.select().from(knowledgeDossiersTable).orderBy(knowledgeDossiersTable.updatedAt);
    res.json(dossiers.reverse());
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
