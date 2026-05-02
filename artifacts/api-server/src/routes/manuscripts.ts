import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  manuscriptAnalysesTable,
  narrativeSkillsTable,
  projectsTable,
  narrativeMatricesTable,
  emotionalCoresTable,
  charactersTable,
} from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type AnalysisResult = {
  title: string;
  globalScore: number; structureScore: number; emotionScore: number;
  archetypeScore: number; originalityScore: number; coherenceScore: number;
  strengths: string[]; weaknesses: string[];
  detectedArchetypes: string[]; detectedEmotions: string[];
  appliedTechniques: string[]; missingTechniques: string[];
  coherenceValidations: string[]; coherenceIssues: string[];
  structureAnalysis: string; emotionAnalysis: string;
  recommendations: string; coherenceAnalysis: string; verdict: string;
  comparableWorks: Array<{ title: string; author: string; relevance: string }>;
};

// ---------------------------------------------------------------------------
// SSE helpers
// ---------------------------------------------------------------------------
function sseSetup(res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
}
function sseSend(res: Response, event: Record<string, unknown>) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

// ---------------------------------------------------------------------------
// Build project context block from DB
// ---------------------------------------------------------------------------
async function buildProjectContext(projectId: string): Promise<string> {
  const [project, matrix, emotional, chars] = await Promise.all([
    db.select().from(projectsTable).where(eq(projectsTable.id, projectId)).limit(1),
    db.select().from(narrativeMatricesTable).where(eq(narrativeMatricesTable.projectId, projectId)).limit(1),
    db.select().from(emotionalCoresTable).where(eq(emotionalCoresTable.projectId, projectId)).limit(1),
    db.select().from(charactersTable).where(eq(charactersTable.projectId, projectId)).limit(8),
  ]);

  if (!project[0]) return "";

  const p = project[0];
  const m = matrix[0];
  const e = emotional[0];

  const lines: string[] = [
    `═══ CONTEXTE DU PROJET : "${p.title}" ═══`,
    `Genre : ${p.genre} | Ton : ${p.tone} | Format : ${p.targetFormat}`,
    p.targetAudience ? `Audience cible : ${p.targetAudience}` : "",
    p.artisticAmbition ? `Ambition artistique : ${p.artisticAmbition}` : "",
    `Idée source : ${p.rawIdea}`,
  ];

  if (m) {
    lines.push("", "── Matrice Narrative ──");
    if (m.logline) lines.push(`Logline : ${m.logline}`);
    if (m.centralConflict) lines.push(`Conflit central : ${m.centralConflict}`);
    if (m.protagonist) lines.push(`Protagoniste : ${m.protagonist}`);
    if (m.antagonist) lines.push(`Antagoniste : ${m.antagonist}`);
    if (m.emotionalStakes) lines.push(`Enjeux émotionnels : ${m.emotionalStakes}`);
    if (m.themes?.length) lines.push(`Thèmes : ${m.themes.join(", ")}`);
    if (m.symbolicMotifs?.length) lines.push(`Motifs symboliques : ${m.symbolicMotifs.join(", ")}`);
    if (m.visibleWorld) lines.push(`Monde visible : ${m.visibleWorld}`);
    if (m.invisibleForces) lines.push(`Forces invisibles : ${m.invisibleForces}`);
  }

  if (e) {
    lines.push("", "── Noyau Émotionnel du Protagoniste ──");
    if (e.hiddenWound) lines.push(`Blessure cachée : ${e.hiddenWound}`);
    if (e.deepNeed) lines.push(`Besoin profond : ${e.deepNeed}`);
    if (e.centralFear) lines.push(`Peur centrale : ${e.centralFear}`);
    if (e.dominantEmotion) lines.push(`Émotion dominante : ${e.dominantEmotion}`);
    if (e.protectionMask) lines.push(`Masque de protection : ${e.protectionMask}`);
    if (e.apparentDesire) lines.push(`Désir apparent : ${e.apparentDesire}`);
    if (e.transformationArc) lines.push(`Arc de transformation : ${e.transformationArc}`);
    if (e.emotionalContradiction) lines.push(`Contradiction émotionnelle : ${e.emotionalContradiction}`);
  }

  if (chars.length > 0) {
    lines.push("", "── Personnages ──");
    for (const c of chars) {
      const parts = [`${c.name} [${c.role}]`];
      if (c.wound) parts.push(`blessure: ${c.wound}`);
      if (c.fear) parts.push(`peur: ${c.fear}`);
      if (c.externalObjective) parts.push(`objectif: ${c.externalObjective}`);
      if (c.innerNeed) parts.push(`besoin: ${c.innerNeed}`);
      if (c.contradiction) parts.push(`contradiction: ${c.contradiction}`);
      lines.push(`• ${parts.join(" | ")}`);
    }
  }

  lines.push("═══════════════════════════════════════");
  return lines.filter(Boolean).join("\n");
}

// ---------------------------------------------------------------------------
// POST /api/manuscripts/analyze
// ---------------------------------------------------------------------------
router.post("/manuscripts/analyze", (req, res) => {
  void (async () => {
    const isSSE = (req.headers["accept"] ?? "").includes("text/event-stream");
    if (isSSE) sseSetup(res);
    const send = (e: Record<string, unknown>) => { if (isSSE) sseSend(res, e); };

    try {
      const { content, projectId } = req.body as { content: string; projectId?: string };
      if (!content || content.trim().length < 50) {
        send({ type: "error", message: "Le texte est trop court (minimum 50 caractères)." });
        if (isSSE) res.end(); else res.status(400).json({ error: "Texte trop court" });
        return;
      }

      const wordCount = content.trim().split(/\s+/).length;
      const excerpt = content.slice(0, 500);
      const analysisInput = content.slice(0, 4500);
      const hasProjectContext = !!projectId;

      send({ type: "progress", step: "Chargement de la bibliothèque narrative...", percent: 5 });

      // Parallel: load skills + project context
      const [activeSkills, projectContext] = await Promise.all([
        db.select({ name: narrativeSkillsTable.name, category: narrativeSkillsTable.category, isUniversal: narrativeSkillsTable.isUniversal })
          .from(narrativeSkillsTable).where(eq(narrativeSkillsTable.isActive, true)),
        projectId ? buildProjectContext(projectId) : Promise.resolve(""),
      ]);

      const skillsRef = activeSkills.length > 0
        ? `\nBIBLIOTHÈQUE NARRATIVE MONDIALE (${activeSkills.length} techniques validées) :\n${activeSkills.map(s => `- ${s.name} [${s.category}]${s.isUniversal ? " ★" : ""}`).join("\n")}`
        : "";

      send({ type: "progress", step: hasProjectContext ? "Chargement du contexte projet..." : "Analyse structurelle...", percent: 20 });

      const systemPrompt = `Tu es le plus grand analyste narratif au monde — précision d'un éditeur Gallimard, sensibilité d'un jury Cannes, rigueur d'un professeur de l'AFI. Tu combines Aristote, McKee, Vogler, Jung, et Propp. Tu travailles exclusivement en français. Tu réponds UNIQUEMENT en JSON valide, sans commentaire.`;

      const coherenceBlock = projectContext ? `

${projectContext}

MISSION SUPPLÉMENTAIRE — ANALYSE DE COHÉRENCE :
Ce texte est un extrait du projet décrit ci-dessus. En plus de l'analyse standard :
1. Évalue la cohérence de ce texte avec les intentions définies dans la matrice.
2. Identifie les POINTS DE VALIDATION (ce qui est fidèle aux intentions).
3. Identifie les POINTS DE FRICTION (ce qui contredit ou manque par rapport à la matrice).
4. Fournis un score de cohérence (0-100) et une analyse de cohérence approfondie.
Un score de 100 = le texte incarne parfaitement la vision définie. Un score < 50 = dérive significative.` : "";

      const userPrompt = `Analyse ce texte narratif avec une précision chirurgicale :

---
${analysisInput}
---

${wordCount > 100 ? `(Texte original : ${wordCount} mots — analyse de l'extrait disponible)` : ""}
${skillsRef}
${coherenceBlock}

Génère un objet JSON avec EXACTEMENT ces champs :

{
  "title": "titre court pour cette analyse (ex: 'Diagnostic — Acte I' ou 'Analyse contextuelle — Chapitre 3')",
  "globalScore": <entier 0-100>,
  "structureScore": <entier 0-100>,
  "emotionScore": <entier 0-100>,
  "archetypeScore": <entier 0-100>,
  "originalityScore": <entier 0-100>,
  "coherenceScore": <entier 0-100 — cohérence avec la matrice ; 50 par défaut si pas de contexte projet>,
  "verdict": "phrase-verdict lapidaire < 20 mots — honnête, directe, mémorable",
  "strengths": ["FORCE 1 — spécifique au texte, pas générique", "FORCE 2", "FORCE 3"],
  "weaknesses": ["FAIBLESSE 1 — avec piste de correction concrète", "FAIBLESSE 2", "FAIBLESSE 3"],
  "detectedArchetypes": ["archétype 1", "archétype 2", "archétype 3"],
  "detectedEmotions": ["émotion 1", "émotion 2", "émotion 3"],
  "appliedTechniques": ["technique narrative déjà présente 1", "technique 2", "technique 3"],
  "missingTechniques": ["technique manquante qui élèverait ce texte 1", "technique 2", "technique 3"],
  "coherenceValidations": ${hasProjectContext ? '["ce qui est cohérent avec la matrice 1", "validation 2", "validation 3"]' : '[]'},
  "coherenceIssues": ${hasProjectContext ? '["ce qui contredit ou manque par rapport à la matrice 1", "friction 2", "friction 3"]' : '[]'},
  "structureAnalysis": "analyse structurelle approfondie (3-4 §) : architecture actuelle, rythme, tension, gestion de l'information narrative",
  "emotionAnalysis": "analyse émotionnelle approfondie (2-3 §) : émotions suscitées, mécanismes, profondeur, ce qui manque",
  "recommendations": "recommandations concrètes et actionnables (3-4 §) — chaque recommandation avec exemple précis",
  "coherenceAnalysis": "${hasProjectContext ? "analyse de cohérence approfondie (2-3 §) : fidélité aux intentions, dérives détectées, comment rapprocher le texte de la vision" : ""}",
  "comparableWorks": [
    { "title": "titre réel", "author": "auteur réel", "relevance": "pourquoi cette œuvre est la référence exacte pour ce texte" },
    { "title": "...", "author": "...", "relevance": "..." },
    { "title": "...", "author": "...", "relevance": "..." }
  ]
}

Sois PRÉCIS et HONNÊTE. La vérité utile, pas la flatterie stérile.`;

      send({ type: "progress", step: "L'IA analyse votre texte en profondeur...", percent: 40 });

      const response = await openai.chat.completions.create({
        model: "gpt-5.4",
        max_completion_tokens: 10000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      send({ type: "progress", step: "Compilation du rapport...", percent: 88 });

      const raw = response.choices[0]?.message?.content;
      if (!raw) throw new Error("Réponse IA vide");
      const data = JSON.parse(raw) as AnalysisResult;

      const [saved] = await db.insert(manuscriptAnalysesTable).values({
        title: data.title ?? "Analyse narrative",
        projectId: projectId ?? null,
        contentExcerpt: excerpt,
        wordCount,
        globalScore: data.globalScore ?? 50,
        structureScore: data.structureScore ?? 50,
        emotionScore: data.emotionScore ?? 50,
        archetypeScore: data.archetypeScore ?? 50,
        originalityScore: data.originalityScore ?? 50,
        coherenceScore: hasProjectContext ? (data.coherenceScore ?? 50) : 0,
        strengths: data.strengths ?? [],
        weaknesses: data.weaknesses ?? [],
        detectedArchetypes: data.detectedArchetypes ?? [],
        detectedEmotions: data.detectedEmotions ?? [],
        appliedTechniques: data.appliedTechniques ?? [],
        missingTechniques: data.missingTechniques ?? [],
        coherenceValidations: data.coherenceValidations ?? [],
        coherenceIssues: data.coherenceIssues ?? [],
        comparableWorks: data.comparableWorks ?? [],
        structureAnalysis: data.structureAnalysis ?? "",
        emotionAnalysis: data.emotionAnalysis ?? "",
        recommendations: data.recommendations ?? "",
        coherenceAnalysis: data.coherenceAnalysis ?? "",
        verdict: data.verdict ?? "",
      }).returning();

      send({ type: "progress", step: "Rapport prêt.", percent: 100 });
      if (isSSE) { sseSend(res, { type: "done", data: saved }); res.end(); }
      else res.json(saved);
    } catch (err) {
      req.log.error({ err });
      send({ type: "error", message: "Erreur lors de l'analyse IA" });
      if (isSSE) res.end();
      else if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
  })();
});

// ---------------------------------------------------------------------------
// GET /api/manuscripts  (optional ?projectId=)
// ---------------------------------------------------------------------------
router.get("/manuscripts", async (req, res) => {
  try {
    const { projectId } = req.query as { projectId?: string };
    let rows = await db.select().from(manuscriptAnalysesTable)
      .orderBy(manuscriptAnalysesTable.createdAt);
    if (projectId) rows = rows.filter(r => r.projectId === projectId);
    res.json(rows.reverse());
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/manuscripts/:id
// ---------------------------------------------------------------------------
router.delete("/manuscripts/:id", async (req, res) => {
  try {
    await db.delete(manuscriptAnalysesTable).where(eq(manuscriptAnalysesTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
