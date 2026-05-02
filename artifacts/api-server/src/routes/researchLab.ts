import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { researchEntriesTable, knowledgeDossiersTable, narrativeSkillsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  generateResearchEntry, generateCrossCulturalSynthesis, generateEmotionalAtlas,
  generateConflictGrammar, generateArchetypeDeepDive, generateEvolutionSpiral,
  generateProblemSolution, selectDailyTarget,
  ERAS, CULTURES, MEDIUMS, RESEARCH_TYPES, UNIVERSAL_THEMES, NARRATIVE_EMOTIONS, UNIVERSAL_ARCHETYPES,
  type ResearchEntryData,
} from "../services/researchLabService.js";

const router: IRouter = Router();

// SSE helper
async function sseRun(req: Request, res: Response, steps: [string, string, string], work: () => Promise<unknown>): Promise<void> {
  const isSSE = (req.headers["accept"] ?? "").includes("text/event-stream");
  const send = (e: Record<string, unknown>) => { if (isSSE) res.write(`data: ${JSON.stringify(e)}\n\n`); };
  if (isSSE) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
  }
  send({ type: "progress", step: steps[0], percent: 8 });
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

// Helper: save entry + extract skills
async function saveEntry(data: ResearchEntryData, meta: {
  researchType: string; era?: string; eraLabel?: string; eraStart?: number; eraEnd?: number;
  culture?: string; cultureLabel?: string; culture2?: string; culture2Label?: string;
  medium?: string; customInput?: string;
}) {
  const [entry] = await db.insert(researchEntriesTable).values({
    title: data.title, researchType: meta.researchType,
    era: meta.era ?? "", eraLabel: meta.eraLabel ?? "",
    eraStart: meta.eraStart, eraEnd: meta.eraEnd,
    culture: meta.culture ?? "", cultureLabel: meta.cultureLabel ?? "",
    culture2: meta.culture2 ?? "", culture2Label: meta.culture2Label ?? "",
    medium: meta.medium ?? "", customInput: meta.customInput ?? "",
    summary: data.summary, keyTechniques: data.keyTechniques,
    emotionalPrinciples: data.emotionalPrinciples, culturalContext: data.culturalContext,
    notableWorks: data.notableWorks, narrativeLessons: data.narrativeLessons,
    themes: data.themes ?? [], universalScore: data.universalScore ?? 5,
    skillsExtracted: data.extractedSkills.length > 0, extractedSkillIds: [],
  }).returning();

  const skillIds: string[] = [];
  for (const sk of data.extractedSkills) {
    const [saved] = await db.insert(narrativeSkillsTable).values({
      name: sk.name, description: sk.description, category: sk.category,
      promptContent: sk.promptContent, isActive: false, isGlobal: true,
    }).returning();
    skillIds.push(saved.id);
  }
  if (skillIds.length > 0) {
    await db.update(researchEntriesTable).set({ extractedSkillIds: skillIds }).where(eq(researchEntriesTable.id, entry.id));
  }
  return { ...entry, extractedSkillIds: skillIds };
}

// GET /api/research-lab/taxonomy
router.get("/research-lab/taxonomy", (_req, res) => {
  res.json({ eras: ERAS, cultures: CULTURES, mediums: MEDIUMS, researchTypes: RESEARCH_TYPES,
    universalThemes: UNIVERSAL_THEMES, narrativeEmotions: NARRATIVE_EMOTIONS, universalArchetypes: UNIVERSAL_ARCHETYPES });
});

// GET /api/research-lab/entries
router.get("/research-lab/entries", async (req, res) => {
  try {
    const entries = await db.select().from(researchEntriesTable).orderBy(researchEntriesTable.createdAt);
    res.json(entries.reverse());
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

// GET /api/research-lab/entries/:id
router.get("/research-lab/entries/:id", async (req, res) => {
  try {
    const [entry] = await db.select().from(researchEntriesTable).where(eq(researchEntriesTable.id, req.params.id));
    if (!entry) return res.status(404).json({ error: "Not found" });
    res.json(entry);
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

// DELETE /api/research-lab/entries/:id
router.delete("/research-lab/entries/:id", async (req, res) => {
  try {
    await db.delete(researchEntriesTable).where(eq(researchEntriesTable.id, req.params.id));
    res.status(204).send();
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

// POST /api/research-lab/generate
router.post("/research-lab/generate", (req, res) => {
  void (async () => {
    try {
      const body = req.body as {
        researchType?: string; era?: string; culture?: string; culture2?: string;
        medium?: string; customInput?: string; archetypeCultures?: string[];
      };
      const rType = body.researchType ?? "standard";
      const eraObj = ERAS.find(e => e.key === body.era);
      const cultureObj = CULTURES.find(c => c.key === body.culture);
      const culture2Obj = CULTURES.find(c => c.key === body.culture2);
      const typeObj = RESEARCH_TYPES.find(t => t.key === rType);

      await sseRun(req, res,
        ["Initialisation...", `${typeObj?.icon ?? "🔭"} ${typeObj?.label ?? "Recherche"} en cours...`, "Extraction des skills secrets..."],
        async () => {
          let data: ResearchEntryData;
          switch (rType) {
            case "synthesis":
              data = await generateCrossCulturalSynthesis(body.customInput ?? "La mort du héros", body.culture ?? "western", body.culture2 ?? "japanese");
              return saveEntry(data, { researchType: rType, culture: body.culture, cultureLabel: cultureObj?.label, culture2: body.culture2, culture2Label: culture2Obj?.label, customInput: body.customInput });
            case "emotional_atlas":
              data = await generateEmotionalAtlas(body.customInput ?? "Catharsis");
              return saveEntry(data, { researchType: rType, customInput: body.customInput });
            case "conflict_grammar":
              data = await generateConflictGrammar(body.culture ?? "western");
              return saveEntry(data, { researchType: rType, culture: body.culture, cultureLabel: cultureObj?.label });
            case "archetype_deep":
              data = await generateArchetypeDeepDive(body.customInput ?? "Le Trickster", body.archetypeCultures ?? ["western", "african", "japanese"]);
              return saveEntry(data, { researchType: rType, customInput: body.customInput });
            case "evolution_spiral":
              data = await generateEvolutionSpiral(body.customInput ?? "Le flash-back", body.culture ?? "american");
              return saveEntry(data, { researchType: rType, culture: body.culture, cultureLabel: cultureObj?.label, customInput: body.customInput });
            case "problem_solution":
              data = await generateProblemSolution(body.customInput ?? "L'exposition lourde", body.culture ?? "western");
              return saveEntry(data, { researchType: rType, culture: body.culture, cultureLabel: cultureObj?.label, customInput: body.customInput });
            default:
              if (!body.era || !body.culture) throw new Error("era et culture requis pour standard");
              data = await generateResearchEntry(body.era, body.culture, body.medium ?? "cinema");
              return saveEntry(data, { researchType: "standard", era: body.era, eraLabel: eraObj?.label, eraStart: eraObj?.start, eraEnd: eraObj?.end, culture: body.culture, cultureLabel: cultureObj?.label, medium: body.medium ?? "cinema" });
          }
        });
    } catch (err) {
      req.log.error({ err });
      if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
  })();
});

// POST /api/research-lab/daily
router.post("/research-lab/daily", (req, res) => {
  void (async () => {
    try {
      const existing = await db.select({ era: researchEntriesTable.era, culture: researchEntriesTable.culture, researchType: researchEntriesTable.researchType }).from(researchEntriesTable);
      const target = selectDailyTarget(existing);
      const eraObj = ERAS.find(e => e.key === target.era);
      const cultureObj = CULTURES.find(c => c.key === target.culture);
      const typeObj = RESEARCH_TYPES.find(t => t.key === target.researchType);

      await sseRun(req, res,
        ["Analyse des lacunes de la bibliothèque...", `${typeObj?.icon ?? "🔭"} ${typeObj?.label ?? "Recherche"} automatique...`, "Extraction des skills secrets..."],
        async () => {
          let data: ResearchEntryData;
          switch (target.researchType) {
            case "synthesis":
              data = await generateCrossCulturalSynthesis(target.customInput ?? "La mort du héros", target.culture, CULTURES.find(c => c.key !== target.culture)?.key ?? "japanese");
              return saveEntry(data, { researchType: "synthesis", customInput: target.customInput, culture: target.culture, cultureLabel: cultureObj?.label });
            case "emotional_atlas":
              data = await generateEmotionalAtlas(target.customInput ?? "Catharsis");
              return saveEntry(data, { researchType: "emotional_atlas", customInput: target.customInput });
            case "conflict_grammar":
              data = await generateConflictGrammar(target.culture);
              return saveEntry(data, { researchType: "conflict_grammar", culture: target.culture, cultureLabel: cultureObj?.label });
            case "archetype_deep":
              data = await generateArchetypeDeepDive(target.customInput ?? "Le Trickster", ["western", "african", "japanese"]);
              return saveEntry(data, { researchType: "archetype_deep", customInput: target.customInput });
            case "evolution_spiral":
              data = await generateEvolutionSpiral(target.customInput ?? "Le flash-back", target.culture);
              return saveEntry(data, { researchType: "evolution_spiral", culture: target.culture, cultureLabel: cultureObj?.label, customInput: target.customInput });
            case "problem_solution":
              data = await generateProblemSolution(target.customInput ?? "L'exposition lourde", target.culture);
              return saveEntry(data, { researchType: "problem_solution", culture: target.culture, cultureLabel: cultureObj?.label, customInput: target.customInput });
            default:
              data = await generateResearchEntry(target.era, target.culture, target.medium);
              return saveEntry(data, { researchType: "standard", era: target.era, eraLabel: eraObj?.label, eraStart: eraObj?.start, eraEnd: eraObj?.end, culture: target.culture, cultureLabel: cultureObj?.label, medium: target.medium });
          }
        });
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
    const byType: Record<string, number> = {};
    for (const e of entries) { byType[e.researchType] = (byType[e.researchType] ?? 0) + 1; }
    const coverageMatrix: Record<string, Record<string, boolean>> = {};
    for (const e of entries.filter(e => e.researchType === "standard")) {
      if (!coverageMatrix[e.era]) coverageMatrix[e.era] = {};
      coverageMatrix[e.era][e.culture] = true;
    }
    res.json({ totalEntries: entries.length, culturesExplored: cultures.size, erasExplored: eras.size, totalSkillsExtracted: totalSkills, coverageMatrix, totalPossible: ERAS.length * CULTURES.length, byType });
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

// GET /api/research-lab/dossiers
router.get("/research-lab/dossiers", async (req, res) => {
  try {
    const dossiers = await db.select().from(knowledgeDossiersTable).orderBy(knowledgeDossiersTable.updatedAt);
    res.json(dossiers.reverse());
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
