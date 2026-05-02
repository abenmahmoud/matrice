import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { manuscriptAnalysesTable, narrativeSkillsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type AnalysisResult = {
  title: string;
  globalScore: number; structureScore: number; emotionScore: number;
  archetypeScore: number; originalityScore: number;
  strengths: string[]; weaknesses: string[];
  detectedArchetypes: string[]; detectedEmotions: string[];
  appliedTechniques: string[]; missingTechniques: string[];
  structureAnalysis: string; emotionAnalysis: string;
  recommendations: string; verdict: string;
  comparableWorks: Array<{ title: string; author: string; relevance: string }>;
};

// ---------------------------------------------------------------------------
// SSE helper
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
// POST /api/manuscripts/analyze
// ---------------------------------------------------------------------------
router.post("/manuscripts/analyze", (req, res) => {
  void (async () => {
    const isSSE = (req.headers["accept"] ?? "").includes("text/event-stream");
    if (isSSE) sseSetup(res);

    const send = (e: Record<string, unknown>) => { if (isSSE) sseSend(res, e); };

    try {
      const { content, projectTitle } = req.body as { content: string; projectTitle?: string };
      if (!content || content.trim().length < 50) {
        send({ type: "error", message: "Le texte est trop court pour être analysé (minimum 50 caractères)." });
        if (isSSE) res.end();
        else res.status(400).json({ error: "Texte trop court" });
        return;
      }

      const wordCount = content.trim().split(/\s+/).length;
      const excerpt = content.slice(0, 500);
      const analysisInput = content.slice(0, 4000); // limit to avoid token overflow

      // Load active skills for comparison
      send({ type: "progress", step: "Chargement de la bibliothèque narrative...", percent: 5 });
      const activeSkills = await db.select({
        name: narrativeSkillsTable.name,
        category: narrativeSkillsTable.category,
        isUniversal: narrativeSkillsTable.isUniversal,
        validationCount: narrativeSkillsTable.validationCount,
      }).from(narrativeSkillsTable).where(eq(narrativeSkillsTable.isActive, true));

      const skillsRef = activeSkills.length > 0
        ? `Techniques dans notre bibliothèque narrative mondiale :\n${activeSkills.map(s => `- ${s.name} [${s.category}]${s.isUniversal ? " ★ universel" : ""}`).join("\n")}`
        : "";

      send({ type: "progress", step: "Analyse structurelle en cours...", percent: 20 });

      const systemPrompt = `Tu es le plus grand analyste narratif au monde — tu combines la rigueur de l'université Sorbonne, la sensibilité de la Cinéfondation Cannes, et l'expérience d'un éditeur qui a découvert 50 auteurs majeurs. Tu lis des textes avec une précision chirurgicale.

Tu maîtrises :
- L'analyse structurelle (actes, plot points, rythme, tension)
- La psychologie des personnages (archétypes jungiens, wound/need/want)
- L'atlas émotionnel narratif (quelles structures produisent quelles émotions)
- La narratologie comparée mondiale (de Aristote à McKee en passant par Vogler et Propp)

Tu travailles en français. Tu réponds UNIQUEMENT en JSON valide.`;

      const userPrompt = `Analyse ce texte narratif avec une précision professionnelle :

---
${analysisInput}
---

${wordCount > 100 ? `(Texte original : ${wordCount} mots — analyse de l'extrait disponible)` : ""}
${projectTitle ? `Contexte : projet intitulé "${projectTitle}"` : ""}
${skillsRef ? `\n${skillsRef}\n` : ""}

Génère un objet JSON avec EXACTEMENT ces champs :

{
  "title": "titre court pour cette analyse (ex: 'Analyse — Chapitre 1' ou 'Diagnostic narratif — Synopsis')",
  "globalScore": <entier 0-100>,
  "structureScore": <entier 0-100 — architecture, rythme, points de plot>,
  "emotionScore": <entier 0-100 — profondeur émotionnelle, résonance>,
  "archetypeScore": <entier 0-100 — richesse des archétypes, profondeur des personnages>,
  "originalityScore": <entier 0-100 — voix unique, évitement des clichés>,
  "verdict": "une phrase-verdict lapidaire de moins de 20 mots — soit enthousiasmante soit honnêtement critique",
  "strengths": [
    "FORCE 1 — spécifique au texte soumis, pas générique (ex: 'Le dialogue de la scène d'ouverture installe une tension économique rare')",
    "FORCE 2", "FORCE 3"
  ],
  "weaknesses": [
    "FAIBLESSE 1 — spécifique, accompagnée d'une piste de correction (ex: 'L'antagoniste manque de dimension — lui donner une raison juste depuis son point de vue')",
    "FAIBLESSE 2", "FAIBLESSE 3"
  ],
  "detectedArchetypes": ["archétype 1 présent dans le texte", "archétype 2", "archétype 3"],
  "detectedEmotions": ["émotion dominante 1", "émotion 2", "émotion 3"],
  "appliedTechniques": ["technique narrative déjà appliquée dans ce texte 1", "technique 2", "technique 3"],
  "missingTechniques": ["technique manquante qui élèverait ce texte 1", "technique 2", "technique 3"],
  "structureAnalysis": "analyse structurelle approfondie (3-4 paragraphes) : architecture actuelle, points forts et failles, rythme, tension, gestion de l'information",
  "emotionAnalysis": "analyse émotionnelle approfondie (2-3 paragraphes) : émotions suscitées, mécanismes utilisés, profondeur de la résonance, ce qui est présent et ce qui manque",
  "recommendations": "recommandations concrètes et actionnables (3-4 paragraphes) — chaque recommandation avec un exemple précis de mise en œuvre",
  "comparableWorks": [
    { "title": "titre réel", "author": "auteur réel", "relevance": "pourquoi cette œuvre est la référence pertinente — en quoi ce texte s'en approche ou s'en distingue" },
    { "title": "...", "author": "...", "relevance": "..." },
    { "title": "...", "author": "...", "relevance": "..." }
  ]
}

Sois PRÉCIS et HONNÊTE. Un diagnostic inutilement flatteur ne sert pas l'auteur. Un diagnostic brutal sans piste concrète non plus. Vise la vérité utile.`;

      send({ type: "progress", step: "L'IA lit et analyse votre texte...", percent: 45 });

      const response = await openai.chat.completions.create({
        model: "gpt-5.4",
        max_completion_tokens: 8192,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      send({ type: "progress", step: "Compilation du rapport...", percent: 85 });

      const raw = response.choices[0]?.message?.content;
      if (!raw) throw new Error("Réponse IA vide");
      const data = JSON.parse(raw) as AnalysisResult;

      // Save to DB
      const [saved] = await db.insert(manuscriptAnalysesTable).values({
        title: data.title ?? "Analyse narrative",
        contentExcerpt: excerpt,
        wordCount,
        globalScore: data.globalScore ?? 50,
        structureScore: data.structureScore ?? 50,
        emotionScore: data.emotionScore ?? 50,
        archetypeScore: data.archetypeScore ?? 50,
        originalityScore: data.originalityScore ?? 50,
        strengths: data.strengths ?? [],
        weaknesses: data.weaknesses ?? [],
        detectedArchetypes: data.detectedArchetypes ?? [],
        detectedEmotions: data.detectedEmotions ?? [],
        appliedTechniques: data.appliedTechniques ?? [],
        missingTechniques: data.missingTechniques ?? [],
        comparableWorks: data.comparableWorks ?? [],
        structureAnalysis: data.structureAnalysis ?? "",
        emotionAnalysis: data.emotionAnalysis ?? "",
        recommendations: data.recommendations ?? "",
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
// GET /api/manuscripts
// ---------------------------------------------------------------------------
router.get("/manuscripts", async (req, res) => {
  try {
    const analyses = await db.select().from(manuscriptAnalysesTable)
      .orderBy(manuscriptAnalysesTable.createdAt);
    res.json(analyses.reverse());
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
