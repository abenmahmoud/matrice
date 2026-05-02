import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import {
  projectsTable, narrativeMatricesTable, emotionalCoresTable, emotionalPathsTable,
  charactersTable, relationshipsTable, worldDataTable, researchDataTable,
  hpsaScoresTable, bookOutlinesTable, screenplaysTable, seriesTable, pitchDocumentsTable,
  narrativeSkillsTable, projectSkillsTable
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  generateNarrativeMatrix, generateEmotionalCore, generateEmotionalPath,
  generateCharacters, generateRelationships, generateWorldAndTimeline,
  generateResearchNotes, generateHpsaScore, checkCoherence,
  generateBookOutline, generateScreenplay, generateSeries, generatePitch
} from "../services/generationService.js";

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
    return rows.map(r => `[${r.skill.category.toUpperCase()}] ${r.skill.name}:\n${r.skill.promptContent}`).join("\n\n");
  } catch {
    return "";
  }
}

async function sseRun(
  req: Request,
  res: Response,
  steps: [string, string, string],
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
      progression: 5,
    }).returning();
    res.status(201).json(project);
  } catch (err) {
    req.log.error({ err }, "Failed to create project");
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
    const rels = generateRelationships(req.params.id, chars);
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

export default router;
