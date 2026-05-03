import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import {
  projectsTable, narrativeMatricesTable, emotionalCoresTable, emotionalPathsTable,
  charactersTable, relationshipsTable, worldDataTable, researchDataTable,
  hpsaScoresTable, bookOutlinesTable, screenplaysTable, seriesTable, pitchDocumentsTable,
  narrativeSkillsTable, projectSkillsTable,
  filmDataTable, filmScenesTable
} from "@workspace/db";
import { eq, and, asc } from "drizzle-orm";
import {
  generateNarrativeMatrix, generateEmotionalCore, generateEmotionalPath,
  generateCharacters, generateRelationships, generateWorldAndTimeline,
  generateResearchNotes, generateHpsaScore, checkCoherence,
  generateBookOutline, generateScreenplay, generateSeries, generatePitch,
  autoLinkSkills, generateTensionArc, generateAtmosphere, characterDialogue, generateDirectorMode,
  generateEchoDuTemps, generateMiroirArtistique, generateCinqPiliers, generateSequencier, generateNoteIntention,
  generateFilmData, generatePlayableScenes, checkSceneHpsa, generateChapterProse,
  generateBeatFountain, generateFountainDialogue
} from "../services/generationService.js";
import { tensionArcsTable, atmosphereDataTable, echoTempsTable, miroirArtistiqueTable, cinqPiliersTable, sequencierTable, noteIntentionTable, contentVersionsTable } from "@workspace/db";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getSkillsContext(projectId: string): Promise<string> {
  try {
    const rows = await db
      .select({ skill: narrativeSkillsTable })
      .from(projectSkillsTable)
      .innerJoin(narrativeSkillsTable, eq(projectSkillsTable.skillId, narrativeSkillsTable.id))
      .where(and(eq(projectSkillsTable.projectId, projectId), eq(narrativeSkillsTable.isActive, true)));
    if (!rows.length) return "";

    // Split by confidence — universal skills (validated by 3+ cultural traditions) carry max weight
    const universal = rows.filter(r => r.skill.isUniversal).sort((a, b) => b.skill.validationCount - a.skill.validationCount);
    const specialized = rows.filter(r => !r.skill.isUniversal);

    const parts: string[] = [];

    if (universal.length > 0) {
      parts.push(
        `## RÈGLES UNIVERSELLES — validées par ${universal.length > 1 ? "plusieurs" : "une"} tradition(s) culturelle(s) — poids MAXIMAL, applique toujours :`,
        ...universal.map(r =>
          `[${r.skill.category.toUpperCase()}] ${r.skill.name} ★ (${r.skill.validationCount} validations cross-culturelles):\n${r.skill.promptContent}`
        )
      );
    }

    if (specialized.length > 0) {
      if (parts.length > 0) parts.push("");
      parts.push(
        "## TECHNIQUES SPÉCIALISÉES — applique si pertinent pour ce projet :",
        ...specialized.map(r =>
          `[${r.skill.category.toUpperCase()}] ${r.skill.name}:\n${r.skill.promptContent}`
        )
      );
    }

    return parts.join("\n\n");
  } catch {
    return "";
  }
}

async function sseRun(
  req: Request,
  res: Response,
  steps: string[],
  work: () => Promise<unknown>
): Promise<void> {
  const isSSE = (req.headers["accept"] ?? "").includes("text/event-stream");
  const send = (event: Record<string, unknown>) => {
    if (isSSE) res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  if (isSSE) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    send({ type: "progress", step: steps[0], percent: 10 });
  }

  try {
    send({ type: "progress", step: steps[1], percent: 35 });
    const result = await work();
    send({ type: "progress", step: steps[2], percent: 90 });
    if (isSSE) {
      send({ type: "done", data: result });
      res.end();
    } else {
      res.json(result);
    }
  } catch (err) {
    if (isSSE) {
      send({ type: "error", message: "Erreur lors de la génération IA" });
      res.end();
    } else {
      throw err;
    }
  }
}

// ---------------------------------------------------------------------------
// Projects CRUD
// ---------------------------------------------------------------------------

// GET /api/projects
router.get("/projects", async (req, res) => {
  try {
    const projects = await db.select().from(projectsTable).orderBy(projectsTable.updatedAt);
    res.json(projects.reverse());
  } catch (err) {
    req.log.error({ err }, "Failed to list projects");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/projects
router.post("/projects", async (req, res) => {
  try {
    const body = req.body;
    const [project] = await db.insert(projectsTable).values({
      title: body.title,
      rawIdea: body.rawIdea,
      inputType: body.inputType,
      genre: body.genre,
      tone: body.tone,
      targetFormat: body.targetFormat,
      temporalLogic: body.temporalLogic,
      realityLevel: body.realityLevel,
      targetAudience: body.targetAudience,
      artisticAmbition: body.artisticAmbition,
      visualMoods: body.visualMoods ?? [],
      cinematicReferences: body.cinematicReferences ?? "",
      inspirationSources: body.inspirationSources ?? "",
      manuscriptExcerpt: body.manuscriptExcerpt ?? "",
      progression: 5,
    }).returning();
    res.status(201).json(project);
  } catch (err) {
    req.log.error({ err }, "Failed to create project");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/projects/:id/status — module completion map
router.get("/projects/:id/status", async (req, res) => {
  try {
    const id = req.params.id;
    const [matrix, emotional, charRow, relRow, world, research, hpsa, book, screenplay, series, pitch] = await Promise.all([
      db.select({ id: narrativeMatricesTable.id }).from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, id)).limit(1),
      db.select({ id: emotionalCoresTable.id }).from(emotionalCoresTable).where(eq(emotionalCoresTable.projectId, id)).limit(1),
      db.select({ id: charactersTable.id }).from(charactersTable).where(eq(charactersTable.projectId, id)).limit(1),
      db.select({ id: relationshipsTable.id }).from(relationshipsTable).where(eq(relationshipsTable.projectId, id)).limit(1),
      db.select({ id: worldDataTable.id }).from(worldDataTable).where(eq(worldDataTable.projectId, id)).limit(1),
      db.select({ id: researchDataTable.id }).from(researchDataTable).where(eq(researchDataTable.projectId, id)).limit(1),
      db.select({ id: hpsaScoresTable.id }).from(hpsaScoresTable).where(eq(hpsaScoresTable.projectId, id)).limit(1),
      db.select({ id: bookOutlinesTable.id }).from(bookOutlinesTable).where(eq(bookOutlinesTable.projectId, id)).limit(1),
      db.select({ id: screenplaysTable.id }).from(screenplaysTable).where(eq(screenplaysTable.projectId, id)).limit(1),
      db.select({ id: seriesTable.id }).from(seriesTable).where(eq(seriesTable.projectId, id)).limit(1),
      db.select({ id: pitchDocumentsTable.id }).from(pitchDocumentsTable).where(eq(pitchDocumentsTable.projectId, id)).limit(1),
    ]);
    res.json({
      matrix: matrix.length > 0,
      emotionalCore: emotional.length > 0,
      characters: charRow.length > 0,
      relationships: relRow.length > 0,
      world: world.length > 0,
      research: research.length > 0,
      hpsa: hpsa.length > 0,
      book: book.length > 0,
      screenplay: screenplay.length > 0,
      series: series.length > 0,
      pitch: pitch.length > 0,
    });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/projects/:id
router.get("/projects/:id", async (req, res) => {
  try {
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
    if (!project) return res.status(404).json({ error: "Not found" });
    const [matrix] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, req.params.id));
    const [emotionalCore] = await db.select().from(emotionalCoresTable).where(eq(emotionalCoresTable.projectId, req.params.id));
    const characters = await db.select().from(charactersTable).where(eq(charactersTable.projectId, req.params.id));
    res.json({ ...project, matrix: matrix ?? null, emotionalCore: emotionalCore ?? null, characters });
  } catch (err) {
    req.log.error({ err }, "Failed to get project");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/projects/:id
router.put("/projects/:id", async (req, res) => {
  try {
    const [project] = await db.update(projectsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(projectsTable.id, req.params.id))
      .returning();
    if (!project) return res.status(404).json({ error: "Not found" });
    res.json(project);
  } catch (err) {
    req.log.error({ err }, "Failed to update project");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/projects/:id
router.delete("/projects/:id", async (req, res) => {
  try {
    await db.delete(projectsTable).where(eq(projectsTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete project");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/dashboard/summary
router.get("/dashboard/summary", async (req, res) => {
  try {
    const projects = await db.select().from(projectsTable);
    const totalProjects = projects.length;
    const averageProgression = totalProjects > 0 ? projects.reduce((sum, p) => sum + p.progression, 0) / totalProjects : 0;
    const genreCount: Record<string, number> = {};
    const formatCount: Record<string, number> = {};
    projects.forEach(p => {
      genreCount[p.genre] = (genreCount[p.genre] ?? 0) + 1;
      formatCount[p.targetFormat] = (formatCount[p.targetFormat] ?? 0) + 1;
    });
    res.json({
      totalProjects,
      averageProgression: Math.round(averageProgression),
      byGenre: Object.entries(genreCount).map(([genre, count]) => ({ genre, count })),
      byFormat: Object.entries(formatCount).map(([format, count]) => ({ format, count })),
      recentProjects: projects.slice(-5).reverse(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Narrative Matrix
// ---------------------------------------------------------------------------

// POST /api/projects/:id/generate-matrix
router.post("/projects/:id/generate-matrix", (req, res) => {
  void (async () => {
    try {
      const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
      if (!project) { res.status(404).json({ error: "Not found" }); return; }
      const skills = await getSkillsContext(req.params.id);
      await sseRun(req, res,
        ["Lecture du projet...", "Génération de la matrice narrative en cours...", "Enregistrement..."],
        async () => {
          const matrixData = await generateNarrativeMatrix(project, skills);
          const existing = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, req.params.id));
          let matrix;
          if (existing.length > 0) {
            [matrix] = await db.update(narrativeMatricesTable).set({ ...matrixData, updatedAt: new Date() })
              .where(eq(narrativeMatricesTable.projectId, req.params.id)).returning();
          } else {
            [matrix] = await db.insert(narrativeMatricesTable).values({ projectId: req.params.id, ...matrixData }).returning();
          }
          await db.update(projectsTable).set({ progression: Math.max(project.progression, 20), updatedAt: new Date() }).where(eq(projectsTable.id, req.params.id));
          return matrix;
        }
      );
    } catch (err) {
      req.log.error({ err }, "Failed to generate matrix");
      if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
  })();
});

// GET /api/projects/:id/matrix
router.get("/projects/:id/matrix", async (req, res) => {
  try {
    const [matrix] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, req.params.id));
    if (!matrix) return res.status(404).json({ error: "Not found" });
    res.json(matrix);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/projects/:id/matrix
router.put("/projects/:id/matrix", async (req, res) => {
  try {
    const [matrix] = await db.update(narrativeMatricesTable).set({ ...req.body, updatedAt: new Date() })
      .where(eq(narrativeMatricesTable.projectId, req.params.id)).returning();
    if (!matrix) return res.status(404).json({ error: "Not found" });
    res.json(matrix);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/projects/:id/check-coherence
router.post("/projects/:id/check-coherence", async (req, res) => {
  try {
    const [matrix] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, req.params.id));
    if (!matrix) return res.status(404).json({ error: "Matrix not found" });
    const result = checkCoherence(matrix);
    res.json(result);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Emotional Core
// ---------------------------------------------------------------------------

// POST /api/projects/:id/generate-emotional-core
router.post("/projects/:id/generate-emotional-core", (req, res) => {
  void (async () => {
    try {
      const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
      if (!project) { res.status(404).json({ error: "Not found" }); return; }
      const skills = await getSkillsContext(req.params.id);
      await sseRun(req, res,
        ["Lecture du projet...", "Analyse du noyau émotionnel en cours...", "Enregistrement..."],
        async () => {
          const [matrix] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, req.params.id));
          const matrixData = matrix ?? await generateNarrativeMatrix(project, skills);
          const coreData = await generateEmotionalCore(project, matrixData, skills);
          const existing = await db.select().from(emotionalCoresTable).where(eq(emotionalCoresTable.projectId, req.params.id));
          let core;
          if (existing.length > 0) {
            [core] = await db.update(emotionalCoresTable).set({ ...coreData, updatedAt: new Date() })
              .where(eq(emotionalCoresTable.projectId, req.params.id)).returning();
          } else {
            [core] = await db.insert(emotionalCoresTable).values({ projectId: req.params.id, ...coreData }).returning();
          }
          await db.update(projectsTable).set({ progression: Math.max(project.progression, 35), updatedAt: new Date() }).where(eq(projectsTable.id, req.params.id));
          return core;
        }
      );
    } catch (err) {
      req.log.error({ err });
      if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
  })();
});

// GET /api/projects/:id/emotional-core
router.get("/projects/:id/emotional-core", async (req, res) => {
  try {
    const [core] = await db.select().from(emotionalCoresTable).where(eq(emotionalCoresTable.projectId, req.params.id));
    if (!core) return res.status(404).json({ error: "Not found" });
    res.json(core);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/projects/:id/emotional-core
router.put("/projects/:id/emotional-core", async (req, res) => {
  try {
    const [core] = await db.update(emotionalCoresTable).set({ ...req.body, updatedAt: new Date() })
      .where(eq(emotionalCoresTable.projectId, req.params.id)).returning();
    if (!core) return res.status(404).json({ error: "Not found" });
    res.json(core);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Emotional Path
// ---------------------------------------------------------------------------

// POST /api/projects/:id/generate-emotional-path
router.post("/projects/:id/generate-emotional-path", (req, res) => {
  void (async () => {
    try {
      const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
      if (!project) { res.status(404).json({ error: "Not found" }); return; }
      const skills = await getSkillsContext(req.params.id);
      await sseRun(req, res,
        ["Lecture des données émotionnelles...", "Construction du chemin émotionnel...", "Enregistrement..."],
        async () => {
          const [matrix] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, req.params.id));
          const [core] = await db.select().from(emotionalCoresTable).where(eq(emotionalCoresTable.projectId, req.params.id));
          const matrixData = matrix ?? await generateNarrativeMatrix(project, skills);
          const coreData = core ?? await generateEmotionalCore(project, matrixData, skills);
          const stages = await generateEmotionalPath(project, matrixData, coreData, skills);
          const existing = await db.select().from(emotionalPathsTable).where(eq(emotionalPathsTable.projectId, req.params.id));
          let path;
          if (existing.length > 0) {
            [path] = await db.update(emotionalPathsTable).set({ stages, updatedAt: new Date() })
              .where(eq(emotionalPathsTable.projectId, req.params.id)).returning();
          } else {
            [path] = await db.insert(emotionalPathsTable).values({ projectId: req.params.id, stages }).returning();
          }
          return path;
        }
      );
    } catch (err) {
      req.log.error({ err });
      if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
  })();
});

// ---------------------------------------------------------------------------
// Characters
// ---------------------------------------------------------------------------

// POST /api/projects/:id/generate-characters
router.post("/projects/:id/generate-characters", (req, res) => {
  void (async () => {
    try {
      const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
      if (!project) { res.status(404).json({ error: "Not found" }); return; }
      const skills = await getSkillsContext(req.params.id);
      await sseRun(req, res,
        ["Lecture de la matrice...", "Création des personnages en cours...", "Enregistrement..."],
        async () => {
          const [matrix] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, req.params.id));
          const [core] = await db.select().from(emotionalCoresTable).where(eq(emotionalCoresTable.projectId, req.params.id));
          const matrixData = matrix ?? await generateNarrativeMatrix(project, skills);
          const coreData = core ?? await generateEmotionalCore(project, matrixData, skills);
          const charsData = await generateCharacters(project, matrixData, coreData, skills);
          await db.delete(charactersTable).where(eq(charactersTable.projectId, req.params.id));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const chars = await db.insert(charactersTable).values(charsData.map(c => ({ projectId: req.params.id, ...c })) as any[]).returning();
          await db.update(projectsTable).set({ progression: Math.max(project.progression, 50), updatedAt: new Date() }).where(eq(projectsTable.id, req.params.id));
          return chars;
        }
      );
    } catch (err) {
      req.log.error({ err });
      if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
  })();
});

// GET /api/projects/:id/characters
router.get("/projects/:id/characters", async (req, res) => {
  try {
    const chars = await db.select().from(charactersTable).where(eq(charactersTable.projectId, req.params.id));
    res.json(chars);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/projects/:id/characters
router.post("/projects/:id/characters", async (req, res) => {
  try {
    const [char] = await db.insert(charactersTable).values({ projectId: req.params.id, ...req.body }).returning();
    res.status(201).json(char);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/projects/:id/characters/:charId
router.put("/projects/:id/characters/:charId", async (req, res) => {
  try {
    const [char] = await db.update(charactersTable).set(req.body)
      .where(eq(charactersTable.id, req.params.charId)).returning();
    if (!char) return res.status(404).json({ error: "Not found" });
    res.json(char);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/projects/:id/characters/:charId
router.delete("/projects/:id/characters/:charId", async (req, res) => {
  try {
    await db.delete(charactersTable).where(eq(charactersTable.id, req.params.charId));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Relationships
// ---------------------------------------------------------------------------

// POST /api/projects/:id/generate-relationships
router.post("/projects/:id/generate-relationships", async (req, res) => {
  try {
    const chars = await db.select().from(charactersTable).where(eq(charactersTable.projectId, req.params.id));
    const rels = await generateRelationships(req.params.id, chars);
    await db.delete(relationshipsTable).where(eq(relationshipsTable.projectId, req.params.id));
    const inserted = rels.length > 0 ? await db.insert(relationshipsTable).values(rels).returning() : [];
    res.json(inserted);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/projects/:id/relationships
router.get("/projects/:id/relationships", async (req, res) => {
  try {
    const rels = await db.select().from(relationshipsTable).where(eq(relationshipsTable.projectId, req.params.id));
    res.json(rels);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// World
// ---------------------------------------------------------------------------

// POST /api/projects/:id/generate-world
router.post("/projects/:id/generate-world", (req, res) => {
  void (async () => {
    try {
      const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
      if (!project) { res.status(404).json({ error: "Not found" }); return; }
      const skills = await getSkillsContext(req.params.id);
      await sseRun(req, res,
        ["Lecture de la matrice...", "Construction de l'univers et de la chronologie...", "Enregistrement..."],
        async () => {
          const [matrix] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, req.params.id));
          const matrixData = matrix ?? await generateNarrativeMatrix(project, skills);
          const worldData = await generateWorldAndTimeline(project, matrixData, skills);
          const existing = await db.select().from(worldDataTable).where(eq(worldDataTable.projectId, req.params.id));
          let world;
          if (existing.length > 0) {
            [world] = await db.update(worldDataTable).set({ ...worldData, updatedAt: new Date() })
              .where(eq(worldDataTable.projectId, req.params.id)).returning();
          } else {
            [world] = await db.insert(worldDataTable).values({ projectId: req.params.id, ...worldData }).returning();
          }
          return world;
        }
      );
    } catch (err) {
      req.log.error({ err });
      if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
  })();
});

// GET /api/projects/:id/world
router.get("/projects/:id/world", async (req, res) => {
  try {
    const [world] = await db.select().from(worldDataTable).where(eq(worldDataTable.projectId, req.params.id));
    if (!world) return res.status(404).json({ error: "Not found" });
    res.json(world);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/projects/:id/world
router.put("/projects/:id/world", async (req, res) => {
  try {
    const [world] = await db.update(worldDataTable).set({ ...req.body, updatedAt: new Date() })
      .where(eq(worldDataTable.projectId, req.params.id)).returning();
    if (!world) return res.status(404).json({ error: "Not found" });
    res.json(world);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Research
// ---------------------------------------------------------------------------

// POST /api/projects/:id/generate-research-notes
router.post("/projects/:id/generate-research-notes", (req, res) => {
  void (async () => {
    try {
      const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
      if (!project) { res.status(404).json({ error: "Not found" }); return; }
      const skills = await getSkillsContext(req.params.id);
      await sseRun(req, res,
        ["Lecture du projet...", "Génération des notes de recherche...", "Enregistrement..."],
        async () => {
          const [matrix] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, req.params.id));
          const matrixData = matrix ?? await generateNarrativeMatrix(project, skills);
          const researchData = await generateResearchNotes(project, matrixData, skills);
          const existing = await db.select().from(researchDataTable).where(eq(researchDataTable.projectId, req.params.id));
          let research;
          if (existing.length > 0) {
            [research] = await db.update(researchDataTable).set({ ...researchData, updatedAt: new Date() })
              .where(eq(researchDataTable.projectId, req.params.id)).returning();
          } else {
            [research] = await db.insert(researchDataTable).values({ projectId: req.params.id, ...researchData }).returning();
          }
          return research;
        }
      );
    } catch (err) {
      req.log.error({ err });
      if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
  })();
});

// GET /api/projects/:id/research
router.get("/projects/:id/research", async (req, res) => {
  try {
    const [research] = await db.select().from(researchDataTable).where(eq(researchDataTable.projectId, req.params.id));
    if (!research) return res.status(404).json({ error: "Not found" });
    res.json(research);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/projects/:id/research
router.put("/projects/:id/research", async (req, res) => {
  try {
    const [research] = await db.update(researchDataTable).set({ ...req.body, updatedAt: new Date() })
      .where(eq(researchDataTable.projectId, req.params.id)).returning();
    if (!research) return res.status(404).json({ error: "Not found" });
    res.json(research);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// HPSA Score
// ---------------------------------------------------------------------------

// POST /api/projects/:id/generate-hpsa-score
router.post("/projects/:id/generate-hpsa-score", (req, res) => {
  void (async () => {
    try {
      const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
      if (!project) { res.status(404).json({ error: "Not found" }); return; }
      const skills = await getSkillsContext(req.params.id);
      await sseRun(req, res,
        ["Lecture du projet...", "Analyse des scores H.P.S.A. en cours...", "Enregistrement..."],
        async () => {
          const [matrix] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, req.params.id));
          const [core] = await db.select().from(emotionalCoresTable).where(eq(emotionalCoresTable.projectId, req.params.id));
          const matrixData = matrix ?? await generateNarrativeMatrix(project, skills);
          const coreData = core ?? await generateEmotionalCore(project, matrixData, skills);
          const scores = await generateHpsaScore(project, matrixData, coreData, skills);
          const existing = await db.select().from(hpsaScoresTable).where(eq(hpsaScoresTable.projectId, req.params.id));
          let hpsa;
          if (existing.length > 0) {
            [hpsa] = await db.update(hpsaScoresTable).set({ ...scores, updatedAt: new Date() })
              .where(eq(hpsaScoresTable.projectId, req.params.id)).returning();
          } else {
            [hpsa] = await db.insert(hpsaScoresTable).values({ projectId: req.params.id, ...scores }).returning();
          }
          return hpsa;
        }
      );
    } catch (err) {
      req.log.error({ err });
      if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
  })();
});

// GET /api/projects/:id/hpsa
router.get("/projects/:id/hpsa", async (req, res) => {
  try {
    const [hpsa] = await db.select().from(hpsaScoresTable).where(eq(hpsaScoresTable.projectId, req.params.id));
    if (!hpsa) return res.status(404).json({ error: "Not found" });
    res.json(hpsa);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Book Outline
// ---------------------------------------------------------------------------

// POST /api/projects/:id/generate-book-outline
router.post("/projects/:id/generate-book-outline", (req, res) => {
  void (async () => {
    try {
      const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
      if (!project) { res.status(404).json({ error: "Not found" }); return; }
      const skills = await getSkillsContext(req.params.id);
      await sseRun(req, res,
        ["Lecture du projet...", "Construction du plan du livre en cours...", "Enregistrement..."],
        async () => {
          const [matrix] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, req.params.id));
          const [core] = await db.select().from(emotionalCoresTable).where(eq(emotionalCoresTable.projectId, req.params.id));
          const matrixData = matrix ?? await generateNarrativeMatrix(project, skills);
          const coreData = core ?? await generateEmotionalCore(project, matrixData, skills);
          const bookData = await generateBookOutline(project, matrixData, coreData, skills);
          const existing = await db.select().from(bookOutlinesTable).where(eq(bookOutlinesTable.projectId, req.params.id));
          let book;
          if (existing.length > 0) {
            [book] = await db.update(bookOutlinesTable).set({ ...bookData, updatedAt: new Date() })
              .where(eq(bookOutlinesTable.projectId, req.params.id)).returning();
          } else {
            [book] = await db.insert(bookOutlinesTable).values({ projectId: req.params.id, ...bookData }).returning();
          }
          return book;
        }
      );
    } catch (err) {
      req.log.error({ err });
      if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
  })();
});

// GET /api/projects/:id/book
router.get("/projects/:id/book", async (req, res) => {
  try {
    const [book] = await db.select().from(bookOutlinesTable).where(eq(bookOutlinesTable.projectId, req.params.id));
    if (!book) return res.status(404).json({ error: "Not found" });
    res.json(book);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/projects/:id/book
router.put("/projects/:id/book", async (req, res) => {
  try {
    const [book] = await db.update(bookOutlinesTable).set({ ...req.body, updatedAt: new Date() })
      .where(eq(bookOutlinesTable.projectId, req.params.id)).returning();
    if (!book) return res.status(404).json({ error: "Not found" });
    res.json(book);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/projects/:id/book/chapters/:index/generate-prose
router.post("/projects/:id/book/chapters/:index/generate-prose", async (req, res) => {
  try {
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
    if (!project) return res.status(404).json({ error: "Project not found" });

    const [matrixRow] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, req.params.id));
    if (!matrixRow) return res.status(404).json({ error: "Matrix not found — generate matrix first" });

    const skills = await getSkillsContext(req.params.id);
    const result = await generateChapterProse(project, matrixRow, req.body, skills);
    res.json(result);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Screenplay
// ---------------------------------------------------------------------------

// POST /api/projects/:id/generate-screenplay
router.post("/projects/:id/generate-screenplay", (req, res) => {
  void (async () => {
    try {
      const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
      if (!project) { res.status(404).json({ error: "Not found" }); return; }
      const skills = await getSkillsContext(req.params.id);
      await sseRun(req, res,
        ["Lecture du projet...", "Rédaction du scénario en cours...", "Enregistrement..."],
        async () => {
          const [matrix] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, req.params.id));
          const [core] = await db.select().from(emotionalCoresTable).where(eq(emotionalCoresTable.projectId, req.params.id));
          const matrixData = matrix ?? await generateNarrativeMatrix(project, skills);
          const coreData = core ?? await generateEmotionalCore(project, matrixData, skills);
          const spData = await generateScreenplay(project, matrixData, coreData, skills);
          const existing = await db.select().from(screenplaysTable).where(eq(screenplaysTable.projectId, req.params.id));
          let sp;
          if (existing.length > 0) {
            [sp] = await db.update(screenplaysTable).set({ ...spData, updatedAt: new Date() })
              .where(eq(screenplaysTable.projectId, req.params.id)).returning();
          } else {
            [sp] = await db.insert(screenplaysTable).values({ projectId: req.params.id, ...spData }).returning();
          }
          return sp;
        }
      );
    } catch (err) {
      req.log.error({ err });
      if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
  })();
});

// GET /api/projects/:id/screenplay
router.get("/projects/:id/screenplay", async (req, res) => {
  try {
    const [sp] = await db.select().from(screenplaysTable).where(eq(screenplaysTable.projectId, req.params.id));
    if (!sp) return res.status(404).json({ error: "Not found" });
    res.json(sp);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/projects/:id/screenplay
router.put("/projects/:id/screenplay", async (req, res) => {
  try {
    const [sp] = await db.update(screenplaysTable).set({ ...req.body, updatedAt: new Date() })
      .where(eq(screenplaysTable.projectId, req.params.id)).returning();
    if (!sp) return res.status(404).json({ error: "Not found" });
    res.json(sp);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Content Versions — historique de versions
// ---------------------------------------------------------------------------

router.post("/projects/:id/versions", async (req, res) => {
  try {
    const { contentType, contentKey = "full", label, data, wordCount } = req.body as {
      contentType: string; contentKey?: string; label: string; data: Record<string, unknown>; wordCount?: number;
    };
    if (!contentType || !label || !data) return res.status(400).json({ error: "contentType, label et data requis" });
    const [row] = await db.insert(contentVersionsTable).values({
      projectId: req.params.id, contentType, contentKey, label, data, wordCount
    }).returning();
    // Keep only last 20 versions per type+key
    const all = await db.select({ id: contentVersionsTable.id, createdAt: contentVersionsTable.createdAt })
      .from(contentVersionsTable)
      .where(and(
        eq(contentVersionsTable.projectId, req.params.id),
        eq(contentVersionsTable.contentType, contentType),
        eq(contentVersionsTable.contentKey, contentKey)
      ));
    if (all.length > 20) {
      const sorted = all.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const toDelete = sorted.slice(0, all.length - 20);
      for (const old of toDelete) {
        await db.delete(contentVersionsTable).where(eq(contentVersionsTable.id, old.id));
      }
    }
    res.json(row);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/projects/:id/versions/:contentType/:contentKey", async (req, res) => {
  try {
    const rows = await db.select({
      id: contentVersionsTable.id,
      projectId: contentVersionsTable.projectId,
      contentType: contentVersionsTable.contentType,
      contentKey: contentVersionsTable.contentKey,
      label: contentVersionsTable.label,
      wordCount: contentVersionsTable.wordCount,
      createdAt: contentVersionsTable.createdAt,
    }).from(contentVersionsTable).where(and(
      eq(contentVersionsTable.projectId, req.params.id),
      eq(contentVersionsTable.contentType, req.params.contentType),
      eq(contentVersionsTable.contentKey, req.params.contentKey)
    ));
    res.json(rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/projects/:id/versions/single/:versionId", async (req, res) => {
  try {
    const [row] = await db.select().from(contentVersionsTable).where(eq(contentVersionsTable.id, req.params.versionId));
    if (!row) return res.status(404).json({ error: "Version introuvable" });
    res.json(row);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Beat Fountain — prose scène depuis un beat
// ---------------------------------------------------------------------------

router.post("/projects/:id/screenplay/beats/:beatIndex/generate-fountain", async (req, res) => {
  try {
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
    if (!project) return res.status(404).json({ error: "Not found" });
    const [matrix] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, req.params.id));
    if (!matrix) return res.status(400).json({ error: "Matrice narrative requise" });
    const body = req.body as {
      beatNumber: number; beatLabel?: string; beatDescription: string;
      previousBeat?: string; nextBeat?: string; tone?: string;
    };
    const result = await generateBeatFountain(project, matrix, body);
    res.json(result);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Fountain Dialogue — scène de dialogue depuis profils psychologiques
// ---------------------------------------------------------------------------

router.post("/projects/:id/generate-fountain-dialogue", async (req, res) => {
  try {
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
    if (!project) return res.status(404).json({ error: "Not found" });
    const [matrix] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, req.params.id));
    if (!matrix) return res.status(400).json({ error: "Matrice narrative requise" });
    const { char1Id, char2Id, sceneContext, emotionalObjective, conflictType, tone } = req.body as {
      char1Id: string; char2Id: string; sceneContext: string;
      emotionalObjective?: string; conflictType?: string; tone?: string;
    };
    if (!char1Id || !char2Id || !sceneContext) return res.status(400).json({ error: "char1Id, char2Id et sceneContext sont requis" });
    const [char1] = await db.select().from(charactersTable).where(eq(charactersTable.id, char1Id));
    const [char2] = await db.select().from(charactersTable).where(eq(charactersTable.id, char2Id));
    if (!char1 || !char2) return res.status(404).json({ error: "Personnage introuvable" });
    const result = await generateFountainDialogue(project, matrix, char1, char2, { sceneContext, emotionalObjective, conflictType, tone });
    res.json(result);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Series
// ---------------------------------------------------------------------------

// POST /api/projects/:id/generate-series
router.post("/projects/:id/generate-series", (req, res) => {
  void (async () => {
    try {
      const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
      if (!project) { res.status(404).json({ error: "Not found" }); return; }
      const skills = await getSkillsContext(req.params.id);
      await sseRun(req, res,
        ["Lecture du projet...", "Structuration de la série en cours...", "Enregistrement..."],
        async () => {
          const [matrix] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, req.params.id));
          const [core] = await db.select().from(emotionalCoresTable).where(eq(emotionalCoresTable.projectId, req.params.id));
          const matrixData = matrix ?? await generateNarrativeMatrix(project, skills);
          const coreData = core ?? await generateEmotionalCore(project, matrixData, skills);
          const seriesData = await generateSeries(project, matrixData, coreData, skills);
          const existing = await db.select().from(seriesTable).where(eq(seriesTable.projectId, req.params.id));
          let series;
          if (existing.length > 0) {
            [series] = await db.update(seriesTable).set({ ...seriesData, updatedAt: new Date() })
              .where(eq(seriesTable.projectId, req.params.id)).returning();
          } else {
            [series] = await db.insert(seriesTable).values({ projectId: req.params.id, ...seriesData }).returning();
          }
          return series;
        }
      );
    } catch (err) {
      req.log.error({ err });
      if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
  })();
});

// GET /api/projects/:id/series
router.get("/projects/:id/series", async (req, res) => {
  try {
    const [series] = await db.select().from(seriesTable).where(eq(seriesTable.projectId, req.params.id));
    if (!series) return res.status(404).json({ error: "Not found" });
    res.json(series);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/projects/:id/series
router.put("/projects/:id/series", async (req, res) => {
  try {
    const [series] = await db.update(seriesTable).set({ ...req.body, updatedAt: new Date() })
      .where(eq(seriesTable.projectId, req.params.id)).returning();
    if (!series) return res.status(404).json({ error: "Not found" });
    res.json(series);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Pitch
// ---------------------------------------------------------------------------

// POST /api/projects/:id/generate-pitch
router.post("/projects/:id/generate-pitch", (req, res) => {
  void (async () => {
    try {
      const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
      if (!project) { res.status(404).json({ error: "Not found" }); return; }
      const skills = await getSkillsContext(req.params.id);
      await sseRun(req, res,
        ["Lecture du projet...", "Rédaction du dossier pitch en cours...", "Enregistrement..."],
        async () => {
          const [matrix] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, req.params.id));
          const [core] = await db.select().from(emotionalCoresTable).where(eq(emotionalCoresTable.projectId, req.params.id));
          const matrixData = matrix ?? await generateNarrativeMatrix(project, skills);
          const coreData = core ?? await generateEmotionalCore(project, matrixData, skills);
          const pitchData = await generatePitch(project, matrixData, coreData, skills);
          const existing = await db.select().from(pitchDocumentsTable).where(eq(pitchDocumentsTable.projectId, req.params.id));
          let pitch;
          if (existing.length > 0) {
            [pitch] = await db.update(pitchDocumentsTable).set({ ...pitchData, updatedAt: new Date() })
              .where(eq(pitchDocumentsTable.projectId, req.params.id)).returning();
          } else {
            [pitch] = await db.insert(pitchDocumentsTable).values({ projectId: req.params.id, ...pitchData }).returning();
          }
          return pitch;
        }
      );
    } catch (err) {
      req.log.error({ err });
      if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
  })();
});

// GET /api/projects/:id/pitch
router.get("/projects/:id/pitch", async (req, res) => {
  try {
    const [pitch] = await db.select().from(pitchDocumentsTable).where(eq(pitchDocumentsTable.projectId, req.params.id));
    if (!pitch) return res.status(404).json({ error: "Not found" });
    res.json(pitch);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/projects/:id/pitch
router.put("/projects/:id/pitch", async (req, res) => {
  try {
    const [pitch] = await db.update(pitchDocumentsTable).set({ ...req.body, updatedAt: new Date() })
      .where(eq(pitchDocumentsTable.projectId, req.params.id)).returning();
    if (!pitch) return res.status(404).json({ error: "Not found" });
    res.json(pitch);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

// GET /api/projects/:id/export/:type
router.get("/projects/:id/export/:type", async (req, res) => {
  try {
    const { id, type } = req.params;
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
    if (!project) return res.status(404).json({ error: "Not found" });

    let content = "";
    let format = "json";
    let filename = `${project.title.replace(/\s+/g, "_")}`;

    switch (type) {
      case "matrix": {
        const [m] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, id));
        content = JSON.stringify(m ?? {}, null, 2);
        filename += "_matrice.json";
        break;
      }
      case "emotional-core": {
        const [c] = await db.select().from(emotionalCoresTable).where(eq(emotionalCoresTable.projectId, id));
        content = JSON.stringify(c ?? {}, null, 2);
        filename += "_noyau_emotionnel.json";
        break;
      }
      case "hpsa": {
        const [h] = await db.select().from(hpsaScoresTable).where(eq(hpsaScoresTable.projectId, id));
        content = JSON.stringify(h ?? {}, null, 2);
        filename += "_scores_hpsa.json";
        break;
      }
      case "book-outline": {
        const [b] = await db.select().from(bookOutlinesTable).where(eq(bookOutlinesTable.projectId, id));
        if (b) {
          content = `# ${project.title}\n\n## Plan du livre\n\n**Structure :** ${b.structure}\n\n**Synopsis court :**\n${b.shortSynopsis}\n\n## Table des matières\n${(b.tableOfContents as string[] | null)?.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}\n\n## Chapitres\n${(b.chapters as Array<{ number: number; title: string; summary: string }> | null)?.map((c) => `\n### Chapitre ${c.number} : ${c.title}\n${c.summary}`).join("\n")}`;
          format = "markdown";
          filename += "_plan_livre.md";
        }
        break;
      }
      case "screenplay": {
        const [s] = await db.select().from(screenplaysTable).where(eq(screenplaysTable.projectId, id));
        content = (s?.fountainScript as string | null) ?? "";
        format = "fountain";
        filename += "_scenario.fountain";
        break;
      }
      case "pitch": {
        const [p] = await db.select().from(pitchDocumentsTable).where(eq(pitchDocumentsTable.projectId, id));
        if (p) {
          content = `# DOSSIER DE PITCH — ${project.title}\n\n**Format :** ${p.format}\n**Genre :** ${p.genre}\n**Public :** ${p.targetAudience}\n\n## Références comparables\n${(p.comparableReferences as string[] | null)?.join("\n")}\n\n## Note d'auteur\n${p.authorNote}\n\n## Note d'intention\n${p.intentionNote}\n\n## Pourquoi maintenant\n${p.whyNow}\n\n## Direction visuelle\n${p.visualDirection}\n\n## Personnages\n${p.characters}\n\n## Monde\n${p.world}\n\n## Arc narratif\n${p.filmSeasonArc}\n\n## Arguments de vente\n${(p.sellingPoints as string[] | null)?.map((s: string) => `- ${s}`).join("\n")}`;
          format = "markdown";
          filename += "_dossier_pitch.md";
        }
        break;
      }
      case "series-markdown": {
        const [s] = await db.select().from(seriesTable).where(eq(seriesTable.projectId, id));
        if (s) {
          const eps = (s.episodes as Array<{ number: number; title: string; logline?: string; summary: string; cliffhanger?: string; emotionalEvolution?: string }> | null) ?? [];
          const arcs = (s.longArcs as string[] | null) ?? [];
          content = [
            `# BIBLE SÉRIE — ${project.title}`,
            ``,
            `**Format :** ${s.format}`,
            ``,
            `## Concept de saison`,
            s.seasonConcept ?? "",
            ``,
            arcs.length > 0 ? `## Arcs longs\n${arcs.map(a => `- ${a}`).join("\n")}` : "",
            ``,
            `## Épisodes`,
            ...eps.map(ep => [
              `### ÉP ${ep.number} — ${ep.title}`,
              ep.logline ? `*${ep.logline}*` : "",
              ``,
              ep.summary,
              ep.emotionalEvolution ? `\n**Arc émotionnel :** ${ep.emotionalEvolution}` : "",
              ep.cliffhanger ? `\n**Cliffhanger :** ${ep.cliffhanger}` : "",
              ``
            ].filter(Boolean).join("\n")),
          ].join("\n");
          format = "markdown";
          filename += "_bible_serie.md";
        }
        break;
      }
      case "season-arc-json": {
        const [s] = await db.select().from(seriesTable).where(eq(seriesTable.projectId, id));
        const arcData = {
          project: { title: project.title, genre: project.genre, tone: project.tone },
          format: s?.format,
          seasonConcept: s?.seasonConcept,
          longArcs: s?.longArcs,
          episodes: (s?.episodes as Array<{ number: number; title: string; summary: string; cliffhanger?: string; emotionalEvolution?: string }> | null)?.map(ep => ({
            number: ep.number,
            title: ep.title,
            emotionalArc: ep.emotionalEvolution,
            cliffhanger: ep.cliffhanger,
          })),
          progressiveRevelations: s?.progressiveRevelations,
        };
        content = JSON.stringify(arcData, null, 2);
        filename += "_arc_saison.json";
        break;
      }
      case "complete": {
        const [matrix] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, id));
        const [core] = await db.select().from(emotionalCoresTable).where(eq(emotionalCoresTable.projectId, id));
        const chars = await db.select().from(charactersTable).where(eq(charactersTable.projectId, id));
        content = JSON.stringify({ project, matrix, emotionalCore: core, characters: chars }, null, 2);
        filename += "_projet_complet.json";
        break;
      }
      default:
        return res.status(400).json({ error: "Unknown export type" });
    }

    res.json({ type, format, content, filename });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Tension Arc
// ---------------------------------------------------------------------------

router.post("/projects/:id/generate-tension-arc", async (req, res) => {
  try {
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
    if (!project) return res.status(404).json({ error: "Not found" });
    const [matrix] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, req.params.id));
    const arcData = await generateTensionArc(project, matrix ?? null);
    const existing = await db.select().from(tensionArcsTable).where(eq(tensionArcsTable.projectId, req.params.id));
    let arc;
    if (existing.length > 0) {
      [arc] = await db.update(tensionArcsTable).set({ ...arcData, updatedAt: new Date() }).where(eq(tensionArcsTable.projectId, req.params.id)).returning();
    } else {
      [arc] = await db.insert(tensionArcsTable).values({ projectId: req.params.id, ...arcData }).returning();
    }
    res.json(arc);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/projects/:id/tension-arc", async (req, res) => {
  try {
    const [arc] = await db.select().from(tensionArcsTable).where(eq(tensionArcsTable.projectId, req.params.id));
    if (!arc) return res.status(404).json({ error: "Not found" });
    res.json(arc);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Atmosphere
// ---------------------------------------------------------------------------

router.post("/projects/:id/generate-atmosphere", async (req, res) => {
  try {
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
    if (!project) return res.status(404).json({ error: "Not found" });
    const atmData = await generateAtmosphere(project);
    const existing = await db.select().from(atmosphereDataTable).where(eq(atmosphereDataTable.projectId, req.params.id));
    let atm;
    if (existing.length > 0) {
      [atm] = await db.update(atmosphereDataTable).set({ ...atmData, updatedAt: new Date() }).where(eq(atmosphereDataTable.projectId, req.params.id)).returning();
    } else {
      [atm] = await db.insert(atmosphereDataTable).values({ projectId: req.params.id, ...atmData }).returning();
    }
    res.json(atm);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/projects/:id/atmosphere", async (req, res) => {
  try {
    const [atm] = await db.select().from(atmosphereDataTable).where(eq(atmosphereDataTable.projectId, req.params.id));
    if (!atm) return res.status(404).json({ error: "Not found" });
    res.json(atm);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Character Dialogue
// ---------------------------------------------------------------------------

router.post("/projects/:id/characters/:charId/dialogue", async (req, res) => {
  try {
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
    if (!project) return res.status(404).json({ error: "Not found" });
    const [char] = await db.select().from(charactersTable).where(eq(charactersTable.id, req.params.charId));
    if (!char) return res.status(404).json({ error: "Character not found" });
    const { message, history = [] } = req.body as { message: string; history: Array<{ role: "user" | "assistant"; content: string }> };
    if (!message) return res.status(400).json({ error: "message required" });
    const response = await characterDialogue(char, project, message, history);
    res.json({ response });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Écho du Temps
// ---------------------------------------------------------------------------

router.get("/projects/:id/echo-temps", async (req, res) => {
  try {
    const [row] = await db.select().from(echoTempsTable).where(eq(echoTempsTable.projectId, req.params.id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/projects/:id/generate-echo-temps", async (req, res) => {
  try {
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
    if (!project) return res.status(404).json({ error: "Not found" });
    const data = await generateEchoDuTemps(project);
    const existing = await db.select().from(echoTempsTable).where(eq(echoTempsTable.projectId, req.params.id));
    let row;
    if (existing.length > 0) {
      [row] = await db.update(echoTempsTable).set({ ...data, updatedAt: new Date() }).where(eq(echoTempsTable.projectId, req.params.id)).returning();
    } else {
      [row] = await db.insert(echoTempsTable).values({ projectId: req.params.id, ...data }).returning();
    }
    res.json(row);
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

// ---------------------------------------------------------------------------
// Miroir Artistique
// ---------------------------------------------------------------------------

router.get("/projects/:id/miroir", async (req, res) => {
  try {
    const [row] = await db.select().from(miroirArtistiqueTable).where(eq(miroirArtistiqueTable.projectId, req.params.id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/projects/:id/generate-miroir", async (req, res) => {
  try {
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
    if (!project) return res.status(404).json({ error: "Not found" });
    const data = await generateMiroirArtistique(project);
    const existing = await db.select().from(miroirArtistiqueTable).where(eq(miroirArtistiqueTable.projectId, req.params.id));
    let row;
    if (existing.length > 0) {
      [row] = await db.update(miroirArtistiqueTable).set({ ...data, updatedAt: new Date() }).where(eq(miroirArtistiqueTable.projectId, req.params.id)).returning();
    } else {
      [row] = await db.insert(miroirArtistiqueTable).values({ projectId: req.params.id, ...data }).returning();
    }
    res.json(row);
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

// ---------------------------------------------------------------------------
// Les 5 Piliers
// ---------------------------------------------------------------------------

router.get("/projects/:id/cinq-piliers", async (req, res) => {
  try {
    const [row] = await db.select().from(cinqPiliersTable).where(eq(cinqPiliersTable.projectId, req.params.id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/projects/:id/generate-cinq-piliers", async (req, res) => {
  try {
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
    if (!project) return res.status(404).json({ error: "Not found" });
    const data = await generateCinqPiliers(project);
    const existing = await db.select().from(cinqPiliersTable).where(eq(cinqPiliersTable.projectId, req.params.id));
    let row;
    if (existing.length > 0) {
      [row] = await db.update(cinqPiliersTable).set({ ...data, updatedAt: new Date() }).where(eq(cinqPiliersTable.projectId, req.params.id)).returning();
    } else {
      [row] = await db.insert(cinqPiliersTable).values({ projectId: req.params.id, ...data }).returning();
    }
    res.json(row);
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

// ---------------------------------------------------------------------------
// Director Mode — POST /api/projects/:id/director-mode
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Note d'Intention Cinématographique
// ---------------------------------------------------------------------------

router.get("/projects/:id/note-intention", async (req, res) => {
  try {
    const [row] = await db.select().from(noteIntentionTable).where(eq(noteIntentionTable.projectId, req.params.id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/projects/:id/generate-note-intention", async (req, res) => {
  try {
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
    if (!project) return res.status(404).json({ error: "Not found" });
    const [matrixRow] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, req.params.id));
    const skills = await getSkillsContext(req.params.id);
    const data = await generateNoteIntention(project, matrixRow ?? null, skills);
    const existing = await db.select().from(noteIntentionTable).where(eq(noteIntentionTable.projectId, req.params.id));
    let row;
    if (existing.length > 0) {
      [row] = await db.update(noteIntentionTable).set({ ...data, updatedAt: new Date() }).where(eq(noteIntentionTable.projectId, req.params.id)).returning();
    } else {
      [row] = await db.insert(noteIntentionTable).values({ projectId: req.params.id, ...data }).returning();
    }
    req.log.info({ projectId: req.params.id }, "Note d'intention generated");
    res.json(row);
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

// ---------------------------------------------------------------------------
// Séquencier
// ---------------------------------------------------------------------------

router.get("/projects/:id/sequencier", async (req, res) => {
  try {
    const [row] = await db.select().from(sequencierTable).where(eq(sequencierTable.projectId, req.params.id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/projects/:id/generate-sequencier", async (req, res) => {
  try {
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
    if (!project) return res.status(404).json({ error: "Not found" });

    const [matrixRow] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, req.params.id));
    const data = await generateSequencier(project, matrixRow ?? null);

    const existing = await db.select().from(sequencierTable).where(eq(sequencierTable.projectId, req.params.id));
    let row;
    if (existing.length > 0) {
      [row] = await db.update(sequencierTable).set({ ...data, updatedAt: new Date() }).where(eq(sequencierTable.projectId, req.params.id)).returning();
    } else {
      [row] = await db.insert(sequencierTable).values({ projectId: req.params.id, ...data }).returning();
    }
    req.log.info({ projectId: req.params.id, seqCount: data.sequences.length }, "Séquencier generated");
    res.json(row);
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/projects/:id/director-mode", async (req, res) => {
  try {
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
    if (!project) return res.status(404).json({ error: "Not found" });

    const { passage } = req.body as { passage?: string };
    if (!passage || passage.trim().length < 20) {
      return res.status(400).json({ error: "Passage trop court — minimum 20 caractères." });
    }

    const breakdown = await generateDirectorMode(project, passage.trim());
    req.log.info({ projectId: req.params.id }, "Director mode breakdown generated");
    res.json(breakdown);
  } catch (err) {
    req.log.error({ err }, "Failed to generate director breakdown");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Auto-link skills from project vision
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Film Data
// ---------------------------------------------------------------------------

router.get("/projects/:id/film-data", async (req, res) => {
  try {
    const [row] = await db.select().from(filmDataTable).where(eq(filmDataTable.projectId, req.params.id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

router.put("/projects/:id/film-data", async (req, res) => {
  try {
    const [row] = await db.update(filmDataTable).set({ ...req.body, updatedAt: new Date() })
      .where(eq(filmDataTable.projectId, req.params.id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/projects/:id/generate-film-data", (req, res) => {
  void (async () => {
    try {
      const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
      if (!project) { res.status(404).json({ error: "Not found" }); return; }
      const skills = await getSkillsContext(req.params.id);
      await sseRun(req, res,
        ["Lecture du projet...", "Développement du concept cinématographique...", "Enregistrement..."],
        async () => {
          const [matrixRow] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, req.params.id));
          const data = await generateFilmData(project, matrixRow ?? null, skills);
          const existing = await db.select().from(filmDataTable).where(eq(filmDataTable.projectId, req.params.id));
          let row;
          if (existing.length > 0) {
            [row] = await db.update(filmDataTable).set({ ...data, updatedAt: new Date() }).where(eq(filmDataTable.projectId, req.params.id)).returning();
          } else {
            [row] = await db.insert(filmDataTable).values({ projectId: req.params.id, ...data }).returning();
          }
          return row;
        }
      );
    } catch (err) { req.log.error({ err }); if (!res.headersSent) res.status(500).json({ error: "Internal server error" }); }
  })();
});

// ---------------------------------------------------------------------------
// Film Scenes — Scènes Jouables
// ---------------------------------------------------------------------------

router.get("/projects/:id/film-scenes", async (req, res) => {
  try {
    const rows = await db.select().from(filmScenesTable)
      .where(eq(filmScenesTable.projectId, req.params.id))
      .orderBy(asc(filmScenesTable.sceneNumber));
    res.json(rows);
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

router.patch("/projects/:id/film-scenes/:sceneId", async (req, res) => {
  try {
    const [row] = await db.update(filmScenesTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(and(eq(filmScenesTable.id, req.params.sceneId), eq(filmScenesTable.projectId, req.params.id)))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

router.delete("/projects/:id/film-scenes/:sceneId", async (req, res) => {
  try {
    await db.delete(filmScenesTable)
      .where(and(eq(filmScenesTable.id, req.params.sceneId), eq(filmScenesTable.projectId, req.params.id)));
    res.status(204).send();
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/projects/:id/generate-film-scenes", (req, res) => {
  void (async () => {
    try {
      const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
      if (!project) { res.status(404).json({ error: "Not found" }); return; }
      const skills = await getSkillsContext(req.params.id);
      await sseRun(req, res,
        ["Lecture du projet...", "Génération des scènes jouables...", "Analyse dramaturgique...", "Enregistrement..."],
        async () => {
          const [matrixRow] = await db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, req.params.id));
          const [coreRow] = await db.select().from(emotionalCoresTable).where(eq(emotionalCoresTable.projectId, req.params.id));
          const scenes = await generatePlayableScenes(project, matrixRow ?? null, coreRow ?? null, skills);
          // Delete existing scenes for this project and re-insert
          await db.delete(filmScenesTable).where(eq(filmScenesTable.projectId, req.params.id));
          const inserted = [];
          for (const scene of scenes) {
            const [row] = await db.insert(filmScenesTable).values({ projectId: req.params.id, ...scene }).returning();
            inserted.push(row);
          }
          req.log.info({ projectId: req.params.id, count: inserted.length }, "Film scenes generated");
          return inserted;
        }
      );
    } catch (err) { req.log.error({ err }); if (!res.headersSent) res.status(500).json({ error: "Internal server error" }); }
  })();
});

router.post("/projects/:id/check-scene-hpsa", async (req, res) => {
  try {
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
    if (!project) return res.status(404).json({ error: "Not found" });
    const { sceneDescription, context } = req.body as { sceneDescription?: string; context?: string };
    if (!sceneDescription || sceneDescription.trim().length < 20) {
      return res.status(400).json({ error: "Description de scène trop courte — minimum 20 caractères." });
    }
    const result = await checkSceneHpsa(project, sceneDescription.trim(), context);
    req.log.info({ projectId: req.params.id }, "Scene HPSA check done");
    res.json(result);
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

// POST /api/projects/:id/auto-link-skills
router.post("/projects/:id/auto-link-skills", async (req, res) => {
  try {
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
    if (!project) return res.status(404).json({ error: "Not found" });

    const availableSkills = await db.select({
      id: narrativeSkillsTable.id,
      name: narrativeSkillsTable.name,
      category: narrativeSkillsTable.category,
      description: narrativeSkillsTable.description,
      isUniversal: narrativeSkillsTable.isUniversal,
      validationCount: narrativeSkillsTable.validationCount,
    }).from(narrativeSkillsTable).where(eq(narrativeSkillsTable.isActive, true));

    if (!availableSkills.length) return res.json([]);

    const selectedIds = await autoLinkSkills(project, availableSkills);
    const linked: typeof availableSkills = [];

    for (const skillId of selectedIds) {
      const existing = await db.select().from(projectSkillsTable).where(
        and(eq(projectSkillsTable.projectId, req.params.id), eq(projectSkillsTable.skillId, skillId))
      );
      if (existing.length === 0) {
        await db.insert(projectSkillsTable).values({ projectId: req.params.id, skillId });
        const skill = availableSkills.find(s => s.id === skillId);
        if (skill) linked.push(skill);
      }
    }

    req.log.info({ projectId: req.params.id, linked: linked.length }, "Auto-linked skills");
    res.json(linked);
  } catch (err) {
    req.log.error({ err }, "Failed to auto-link skills");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
