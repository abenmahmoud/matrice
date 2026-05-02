/**
 * Generation Service — real AI generation via OpenAI.
 * All functions call GPT with structured JSON output.
 * Falls back gracefully if AI fails so the app stays usable.
 */

import { openai } from "@workspace/integrations-openai-ai-server";

type Project = {
  id: string;
  title: string;
  rawIdea: string;
  inputType?: string | null;
  genre: string;
  tone: string;
  targetFormat: string;
  temporalLogic?: string | null;
  realityLevel?: string | null;
  targetAudience?: string | null;
  artisticAmbition?: string | null;
  visualMoods?: string[] | null;
  cinematicReferences?: string | null;
  inspirationSources?: string | null;
};

type NarrativeMatrix = {
  centralConcept: string;
  logline: string;
  shortPitch: string;
  longSynopsis: string;
  genre: string;
  tone: string;
  themes: string[];
  universeLaws: string[];
  temporalRules: string;
  spatialRules: string;
  visibleWorld: string;
  invisibleForces: string;
  centralConflict: string;
  protagonist: string;
  antagonist: string;
  emotionalStakes: string;
  symbolicMotifs: string[];
  powerObjects: string[];
  secrets: string[];
  possibleEndings: string[];
  coherenceRules: string[];
};

type EmotionalCore = {
  dominantEmotion: string;
  hiddenWound: string;
  emotionalLack: string;
  innerChildSignal: string;
  protectionMask: string;
  apparentDesire: string;
  deepNeed: string;
  centralFear: string;
  shamePoint: string;
  guiltyPoint: string;
  symbolicObject: string;
  symbolicPlace: string;
  emotionalAntagonist: string;
  emotionalContradiction: string;
  correctionPath: string;
  transformationArc: string;
  finalEmotionalState: string;
};

type ScoreCategory = {
  score: number;
  diagnostic: string;
  weaknesses: string[];
  corrections: string[];
  suggestions: string[];
  trendNotes: string;
  clicheRisk: string;
  originalityOpportunity: string;
};

// ---------------------------------------------------------------------------
// Core AI helper
// ---------------------------------------------------------------------------

async function aiJson<T>(systemPrompt: string, userPrompt: string, fallback: T, skillsContext?: string): Promise<T> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: skillsContext ? `${systemPrompt}

### SKILLS IA ACTIFS — applique impérativement ces contraintes créatives :
${skillsContext}` : systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    const content = response.choices[0]?.message?.content;
    if (!content) return fallback;
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

function projectContext(project: Project): string {
  const base = `Titre : "${project.title}"
Idée brute : ${project.rawIdea}
Genre : ${project.genre}
Ton : ${project.tone}
Format cible : ${project.targetFormat}
Public cible : ${project.targetAudience ?? "Adultes exigeants"}
Logique temporelle : ${project.temporalLogic ?? "linéaire"}
Niveau de réalité : ${project.realityLevel ?? "réaliste"}
Ambition artistique : ${project.artisticAmbition ?? "créer une œuvre qui résonne durablement"}`;

  const extras: string[] = [];
  if (project.inspirationSources) extras.push(`Source d'inspiration originelle (rêve / sensation / image) : ${project.inspirationSources}`);
  if ((project.visualMoods as string[] | undefined)?.length) extras.push(`ADN visuel déclaré (atmosphères) : ${(project.visualMoods as string[]).join(", ")}`);
  if (project.cinematicReferences) extras.push(`Références cinématographiques / artistiques : ${project.cinematicReferences}`);

  return extras.length ? `${base}\n${extras.join("\n")}` : base;
}

// ---------------------------------------------------------------------------
// 1. Narrative Matrix
// ---------------------------------------------------------------------------

export async function generateNarrativeMatrix(project: Project, skillsContext?: string): Promise<NarrativeMatrix> {
  const system = `Tu es un dramaturge et architecte narratif de haut niveau, expert des littératures française et mondiale, du cinéma d'auteur et des séries complexes. Tu travailles en français. Tu génères des matrices narratives profondes, originales et cohérentes. Réponds UNIQUEMENT en JSON valide.`;

  const user = `À partir du projet suivant, génère une Matrice Narrative complète et professionnelle.

${projectContext(project)}

${(project.visualMoods as string[] | undefined)?.length || project.cinematicReferences ? `IMPORTANT : Le projet a un ADN visuel déclaré. Incorpore les atmosphères, le langage visuel et les références dans chaque section de la matrice — monde visible, forces invisibles, motifs symboliques, règles de cohérence. La matrice doit respirer visuellement les références de l'auteur.` : ""}

Génère un objet JSON avec exactement ces champs :
{
  "centralConcept": "concept central développé en 3-4 phrases profondes",
  "logline": "logline de 1-2 phrases, percutante, format industrie",
  "shortPitch": "pitch court de 3-5 phrases pour un éditeur/producteur",
  "longSynopsis": "synopsis long de 4-6 paragraphes, complet et littéraire",
  "genre": "${project.genre}",
  "tone": "${project.tone}",
  "themes": ["thème 1", "thème 2", "thème 3", "thème 4"],
  "universeLaws": ["loi 1", "loi 2", "loi 3", "loi 4"],
  "temporalRules": "règles temporelles de l'univers",
  "spatialRules": "règles spatiales et topographiques",
  "visibleWorld": "description du monde visible, tangible",
  "invisibleForces": "forces invisibles qui gouvernent l'univers",
  "centralConflict": "le conflit central en 2-3 phrases précises",
  "protagonist": "portrait du protagoniste en 3-4 phrases",
  "antagonist": "portrait de la force d'opposition en 3-4 phrases",
  "emotionalStakes": "les enjeux émotionnels véritables, pas les enjeux de surface",
  "symbolicMotifs": ["motif 1", "motif 2", "motif 3"],
  "powerObjects": ["objet 1", "objet 2"],
  "secrets": ["secret 1", "secret 2", "secret 3"],
  "possibleEndings": ["fin 1", "fin 2", "fin 3"],
  "coherenceRules": ["règle 1", "règle 2", "règle 3", "règle 4"]
}

Sois précis, profond, original. Évite les clichés. Chaque élément doit être unique à ce projet.`;

  const fallback: NarrativeMatrix = {
    centralConcept: `Au cœur de "${project.title}" se trouve l'idée brute : ${project.rawIdea}`,
    logline: `Un récit de genre ${project.genre} sur : ${project.rawIdea.slice(0, 100)}`,
    shortPitch: project.rawIdea,
    longSynopsis: project.rawIdea,
    genre: project.genre,
    tone: project.tone,
    themes: ["À développer"],
    universeLaws: ["À définir"],
    temporalRules: "Linéaire",
    spatialRules: "Réaliste",
    visibleWorld: "À développer",
    invisibleForces: "À définir",
    centralConflict: "À définir",
    protagonist: "À développer",
    antagonist: "À définir",
    emotionalStakes: "À définir",
    symbolicMotifs: ["À définir"],
    powerObjects: ["À définir"],
    secrets: ["À révéler"],
    possibleEndings: ["À écrire"],
    coherenceRules: ["À établir"],
  };

  return aiJson<NarrativeMatrix>(system, user, fallback, skillsContext);
}

// ---------------------------------------------------------------------------
// 2. Emotional Core
// ---------------------------------------------------------------------------

export async function generateEmotionalCore(project: Project, matrix: NarrativeMatrix, skillsContext?: string): Promise<EmotionalCore> {
  const system = `Tu es un psychologue narratif et thérapeute du récit de haut niveau. Tu analyses les structures émotionnelles profondes des personnages en t'appuyant sur la psychologie du développement, l'attachement, et les théories du traumatisme narratif. Tu travailles en français. Réponds UNIQUEMENT en JSON valide.`;

  const user = `Génère le Noyau Émotionnel du protagoniste de ce projet.

${projectContext(project)}

Matrice narrative déjà générée :
- Concept central : ${matrix.centralConcept}
- Thèmes : ${matrix.themes.join(", ")}
- Protagoniste : ${matrix.protagonist}
- Conflit central : ${matrix.centralConflict}

Génère un objet JSON avec exactement ces champs :
{
  "dominantEmotion": "l'émotion dominante précise et nuancée, pas générique",
  "hiddenWound": "la blessure cachée spécifique à ce personnage et cet univers",
  "emotionalLack": "ce qui manque fondamentalement au protagoniste",
  "innerChildSignal": "comment la blessure se manifeste quand elle est activée",
  "protectionMask": "le masque de protection — ce en quoi il/elle excelle pour ne pas souffrir",
  "apparentDesire": "ce que le protagoniste croit vouloir — le moteur visible",
  "deepNeed": "ce dont il/elle a réellement besoin — invisible à lui/elle même",
  "centralFear": "la peur centrale qui gouverne tous les choix",
  "shamePoint": "ce dont il/elle a honte — spécifique, pas générique",
  "guiltyPoint": "la culpabilité précise envers quelqu'un d'autre",
  "symbolicObject": "l'objet qui concentre toute la blessure",
  "symbolicPlace": "le lieu qui porte la mémoire fondamentale",
  "emotionalAntagonist": "la force qui personnifie la tentation de rester blessé",
  "emotionalContradiction": "la contradiction fondamentale qui anime tout le récit",
  "correctionPath": "le chemin de correction émotionnel — étape par étape",
  "transformationArc": "l'arc de transformation complet du début à la fin",
  "finalEmotionalState": "l'état émotionnel final — précis, gagné, réel"
}`;

  const fallback: EmotionalCore = {
    dominantEmotion: "La peur fondamentale de ne pas être suffisant",
    hiddenWound: "Une blessure ancienne liée aux thèmes du projet",
    emotionalLack: "La capacité à accepter sans contrôler",
    innerChildSignal: "Régression vers la fuite ou la colère",
    protectionMask: "La compétence principale utilisée comme bouclier",
    apparentDesire: "Résoudre le conflit visible",
    deepNeed: "Être vu et accepté tel que l'on est",
    centralFear: "Être abandonné si le masque tombe",
    shamePoint: "Avoir causé ou laissé se produire quelque chose",
    guiltyPoint: "N'avoir pas protégé quelqu'un d'important",
    symbolicObject: "Un objet ordinaire chargé de mémoire",
    symbolicPlace: "Le lieu où tout a commencé",
    emotionalAntagonist: "La force qui offre la solution facile",
    emotionalContradiction: "Veut être aimé mais repousse tout ce qui s'approche",
    correctionPath: "Confrontations progressives avec la blessure",
    transformationArc: "De la protection parfaite à la vulnérabilité choisie",
    finalEmotionalState: "La paix gagnée, fragile, réelle",
  };

  return aiJson<EmotionalCore>(system, user, fallback, skillsContext);
}

// ---------------------------------------------------------------------------
// 3. Emotional Path
// ---------------------------------------------------------------------------

export async function generateEmotionalPath(project: Project, matrix: NarrativeMatrix, emotionalCore: EmotionalCore, skillsContext?: string) {
  const system = `Tu es un architecte du voyage du héros et expert des structures narratives émotionnelles. Tu travailles en français. Réponds UNIQUEMENT en JSON valide.`;

  const user = `Génère les 9 étapes du chemin émotionnel du protagoniste.

${projectContext(project)}

Noyau émotionnel :
- Blessure : ${emotionalCore.hiddenWound}
- Masque : ${emotionalCore.protectionMask}
- Désir apparent : ${emotionalCore.apparentDesire}
- Besoin profond : ${emotionalCore.deepNeed}
- Arc de transformation : ${emotionalCore.transformationArc}

Génère un objet JSON avec un tableau "path" de 9 objets, chacun avec :
{
  "path": [
    { "stage": "blessure", "label": "Blessure initiale", "description": "description précise et unique à ce projet (2-3 phrases)" },
    { "stage": "masque", "label": "Masque de protection", "description": "..." },
    { "stage": "desir", "label": "Désir apparent", "description": "..." },
    { "stage": "conflit", "label": "Conflit central", "description": "..." },
    { "stage": "confrontation", "label": "Confrontation symbolique", "description": "..." },
    { "stage": "effondrement", "label": "Effondrement", "description": "..." },
    { "stage": "verite", "label": "Vérité", "description": "..." },
    { "stage": "correction", "label": "Correction émotionnelle", "description": "..." },
    { "stage": "transformation", "label": "Transformation", "description": "..." }
  ]
}

Chaque description doit être précise, unique à ce projet, littéraire et actionnable pour l'auteur.`;

  type PathResult = { path: Array<{ stage: string; label: string; description: string }> };
  const fallback: PathResult = {
    path: [
      { stage: "blessure", label: "Blessure initiale", description: emotionalCore.hiddenWound },
      { stage: "masque", label: "Masque de protection", description: emotionalCore.protectionMask },
      { stage: "desir", label: "Désir apparent", description: emotionalCore.apparentDesire },
      { stage: "conflit", label: "Conflit central", description: emotionalCore.emotionalContradiction },
      { stage: "confrontation", label: "Confrontation symbolique", description: "Premier face-à-face indirect avec la blessure" },
      { stage: "effondrement", label: "Effondrement", description: "Le masque se brise. Le fond est atteint." },
      { stage: "verite", label: "Vérité", description: "La vérité nue sur la blessure émerge" },
      { stage: "correction", label: "Correction émotionnelle", description: emotionalCore.correctionPath },
      { stage: "transformation", label: "Transformation", description: emotionalCore.transformationArc },
    ],
  };

  const result = await aiJson<PathResult>(system, user, fallback, skillsContext);
  return result.path;
}

// ---------------------------------------------------------------------------
// 4. Characters
// ---------------------------------------------------------------------------

export async function generateCharacters(project: Project, matrix: NarrativeMatrix, emotionalCore: EmotionalCore, skillsContext?: string) {
  const system = `Tu es un créateur de personnages de fiction de haut niveau, spécialisé dans la psychologie des personnages complexes et les arcs narratifs. Tu travailles en français. Réponds UNIQUEMENT en JSON valide.`;

  const user = `Génère 3 personnages principaux pour ce projet.

${projectContext(project)}

Matrice :
- Protagoniste : ${matrix.protagonist}
- Antagoniste : ${matrix.antagonist}
- Conflit central : ${matrix.centralConflict}

Noyau émotionnel :
- Blessure : ${emotionalCore.hiddenWound}
- Arc : ${emotionalCore.transformationArc}

Génère un objet JSON :
{
  "characters": [
    {
      "name": "prénom et nom complets, crédibles et mémorables pour ce genre",
      "role": "Protagoniste",
      "nature": "humain",
      "externalObjective": "objectif externe précis (ce qu'il/elle veut faire dans le récit)",
      "innerNeed": "besoin interne (ce dont il/elle a besoin pour se transformer)",
      "wound": "blessure spécifique et unique",
      "fear": "peur centrale précise",
      "secret": "secret narratif actionnable",
      "contradiction": "contradiction fondamentale qui génère du conflit",
      "transformationArc": "arc de transformation complet",
      "visualIdentity": "description physique et vestimentaire précise, signifiante",
      "voiceStyle": "style de voix, façon de parler, tics linguistiques",
      "linkToConflict": "comment ce personnage est lié au conflit central"
    },
    {
      "name": "...",
      "role": "Antagoniste",
      ...
    },
    {
      "name": "...",
      "role": "Secondaire",
      ...
    }
  ]
}

Les noms doivent être adaptés au genre et à la culture du récit. Chaque personnage doit être distinctif et irremplaçable.`;

  type CharResult = { characters: Array<Record<string, string>> };
  const fallback: CharResult = {
    characters: [
      {
        name: `Protagoniste de ${project.title}`,
        role: "Protagoniste",
        nature: "humain",
        externalObjective: matrix.centralConflict.slice(0, 100),
        innerNeed: emotionalCore.deepNeed,
        wound: emotionalCore.hiddenWound,
        fear: emotionalCore.centralFear,
        secret: matrix.secrets[0] ?? "",
        contradiction: emotionalCore.emotionalContradiction,
        transformationArc: emotionalCore.transformationArc,
        visualIdentity: "À définir",
        voiceStyle: "À définir",
        linkToConflict: "Incarnation du conflit central",
      },
    ],
  };

  const result = await aiJson<CharResult>(system, user, fallback, skillsContext);
  return result.characters;
}

// ---------------------------------------------------------------------------
// 5. Relationships
// ---------------------------------------------------------------------------

export function generateRelationships(projectId: string, characters: Array<{ id: string; name: string; role: string }>) {
  const rels = [];
  if (characters.length >= 2) {
    rels.push({
      projectId,
      characterAId: characters[0].id,
      characterBId: characters[1].id,
      characterAName: characters[0].name,
      characterBName: characters[1].name,
      relationshipType: "Conflit central",
      emotionalTension: "Attraction et répulsion simultanées — ils se reconnaissent comme le miroir de leur blessure",
      hiddenTruth: "Ils ont besoin l'un de l'autre pour se transformer, même si leur relation semble destructrice",
      conflict: "Chaque interaction pousse l'autre à révéler ce qu'il préfère cacher",
      evolution: "De l'opposition frontale à la reconnaissance mutuelle douloureuse",
      symbolicMeaning: "Le conflit intérieur du protagoniste extériorisé dans une relation",
    });
  }
  if (characters.length >= 3) {
    rels.push({
      projectId,
      characterAId: characters[0].id,
      characterBId: characters[2].id,
      characterAName: characters[0].name,
      characterBName: characters[2].name,
      relationshipType: "Alliance fragile",
      emotionalTension: "Confiance méritée mais jamais entièrement accordée",
      hiddenTruth: "Le/la témoin sait quelque chose que le protagoniste refuse de voir",
      conflict: "Jusqu'où peut-on aider quelqu'un qui ne veut pas être aidé ?",
      evolution: "De la loyauté inconditionnelle à une vérité prononcée à voix haute",
      symbolicMeaning: "Ce que le protagoniste pourrait avoir s'il acceptait sa vulnérabilité",
    });
  }
  return rels;
}

// ---------------------------------------------------------------------------
// 6. World & Timeline
// ---------------------------------------------------------------------------

export async function generateWorldAndTimeline(project: Project, matrix: NarrativeMatrix, skillsContext?: string) {
  const system = `Tu es un world-builder expert, spécialisé dans la construction d'univers cohérents et atmosphériques pour la fiction littéraire et cinématographique. Tu travailles en français. Réponds UNIQUEMENT en JSON valide.`;

  const user = `Génère l'univers et la chronologie de ce projet.

${projectContext(project)}

Matrice :
- Monde visible : ${matrix.visibleWorld}
- Forces invisibles : ${matrix.invisibleForces}
- Règles temporelles : ${matrix.temporalRules}
- Lois de l'univers : ${matrix.universeLaws.join(" | ")}

Génère un objet JSON :
{
  "locations": [
    { "name": "nom précis du lieu", "description": "description atmosphérique et narrative (3-4 phrases)", "atmosphere": "atmosphère sensorielle et émotionnelle" },
    { "name": "...", ... },
    { "name": "...", ... }
  ],
  "atmospheres": ["atmosphère globale 1", "atmosphère globale 2", "atmosphère globale 3"],
  "temporalRules": "règles temporelles développées",
  "timelineEvents": [
    { "date": "Avant le récit", "event": "nom de l'événement", "significance": "importance narrative" },
    { "date": "Début", "event": "...", "significance": "..." },
    { "date": "Milieu", "event": "...", "significance": "..." },
    { "date": "Crise", "event": "...", "significance": "..." },
    { "date": "Résolution", "event": "...", "significance": "..." }
  ],
  "parallelTimelines": [],
  "dreamLayers": [],
  "forbiddenRules": ["règle interdite 1", "règle interdite 2"],
  "causeEffectLogic": "logique de causalité de cet univers spécifique"
}

Les lieux doivent être mémorables, chargés de sens narratif. Chaque événement chronologique doit être une étape de transformation.`;

  const fallback = {
    locations: [
      { name: "Lieu Initial", description: "Où tout commence", atmosphere: "Familier et légèrement inquiétant" },
      { name: "Lieu du Seuil", description: "Point de non-retour", atmosphere: "Suspendu entre deux mondes" },
      { name: "Lieu de la Vérité", description: "Où tout se résout", atmosphere: "Intense et inévitable" },
    ],
    atmospheres: ["Tension sous-jacente", "Lumière signifiante", "Sons porteurs de mémoire"],
    temporalRules: matrix.temporalRules,
    timelineEvents: [
      { date: "Avant le récit", event: "La blessure originelle", significance: "L'événement fondateur" },
      { date: "Début", event: "Le déclencheur", significance: "L'inertie devient impossible" },
      { date: "Milieu", event: "La confrontation symbolique", significance: "Premier face-à-face déguisé" },
      { date: "Crise", event: "L'effondrement", significance: "Le masque se brise" },
      { date: "Résolution", event: "La transformation", significance: "Le choix final" },
    ],
    parallelTimelines: [],
    dreamLayers: [],
    forbiddenRules: matrix.universeLaws.map(l => `Interdit : violer — ${l.slice(0, 80)}`),
    causeEffectLogic: `Dans ${project.title}, chaque action émotionnelle crée une réaction narrative.`,
  };

  return aiJson(system, user, fallback);
}

// ---------------------------------------------------------------------------
// 7. Research Notes
// ---------------------------------------------------------------------------

export async function generateResearchNotes(project: Project, matrix: NarrativeMatrix, skillsContext?: string) {
  const system = `Tu es un chercheur littéraire et culturel spécialisé dans l'analyse des tendances narratives, la critique de genre, et le conseil éditorial. Tu travailles en français. Réponds UNIQUEMENT en JSON valide.`;

  const user = `Génère les notes de recherche et d'analyse pour ce projet.

${projectContext(project)}

Thèmes : ${matrix.themes.join(", ")}
Genre : ${project.genre} | Ton : ${project.tone} | Format : ${project.targetFormat}

Génère un objet JSON :
{
  "referenceWorks": [
    { "title": "titre précis", "author": "auteur réel", "medium": "Roman/Film/Série", "relevance": "pourquoi cette œuvre est une référence pertinente" },
    { "title": "...", "author": "...", "medium": "...", "relevance": "..." }
  ],
  "criticalNotes": ["note critique 1", "note critique 2", "note critique 3"],
  "successSignals": ["signal positif 1", "signal positif 2", "signal positif 3"],
  "currentTrends": ["tendance 1", "tendance 2", "tendance 3"],
  "clicheRisks": ["risque de cliché 1", "risque 2", "risque 3"],
  "originalityOpportunities": ["opportunité 1", "opportunité 2", "opportunité 3"],
  "creationNotes": "notes de création longues et détaillées (3-4 phrases)",
  "abstractMechanics": ["mécanique narrative 1", "mécanique 2", "mécanique 3"],
  "humorPatterns": ["pattern d'humour 1", "pattern 2"],
  "suspensePatterns": ["pattern de suspense 1", "pattern 2"],
  "tearTriggers": ["déclencheur émotionnel 1", "déclencheur 2"]
}

Les œuvres de référence doivent être réelles et pertinentes. Les analyses doivent être précises et actionnables.`;

  const fallback = {
    referenceWorks: [
      { title: "À définir", author: "À rechercher", medium: project.genre, relevance: `Traite de ${matrix.themes[0]}` },
    ],
    criticalNotes: ["À développer lors de la recherche"],
    successSignals: [`Le format ${project.targetFormat} est adapté à ce projet`],
    currentTrends: ["Les récits émotionnellement profonds trouvent un public fidèle"],
    clicheRisks: [`Éviter les clichés du genre ${project.genre}`],
    originalityOpportunities: [`Explorer ${matrix.themes[0]} d'une façon inédite`],
    creationNotes: `Notes pour ${project.title} : ${project.artisticAmbition ?? "Créer une œuvre durable"}`,
    abstractMechanics: ["Révélation progressive", "Double lecture", "Tension différée"],
    humorPatterns: ["Humour de contradiction", "Humour de protection"],
    suspensePatterns: ["Information asymétrique", "Promesse narrative"],
    tearTriggers: ["Sacrifice non verbal", "Reconnaissance tardive"],
  };

  return aiJson(system, user, fallback);
}

// ---------------------------------------------------------------------------
// 8. H.P.S.A. Scores
// ---------------------------------------------------------------------------

export async function generateHpsaScore(project: Project, matrix: NarrativeMatrix, emotionalCore: EmotionalCore, skillsContext?: string): Promise<Record<string, ScoreCategory>> {
  const system = `Tu es un analyste narratif et consultant en développement de projets créatifs. Tu évalues les projets narratifs selon 7 axes : humour, pleur (émotion), suspense, attractivité, profondeur émotionnelle, originalité, cohérence. Tu travailles en français. Réponds UNIQUEMENT en JSON valide.`;

  const user = `Évalue ce projet narratif sur 7 axes et génère les scores H.P.S.A.

${projectContext(project)}

Concept central : ${matrix.centralConcept}
Enjeux émotionnels : ${matrix.emotionalStakes}
Émotion dominante : ${emotionalCore.dominantEmotion}
Arc de transformation : ${emotionalCore.transformationArc}

Génère un objet JSON avec exactement ces 7 clés : humour, pleur, suspense, attractivite, profondeurEmotionnelle, originalite, coherence.
Chaque catégorie a cette structure :
{
  "score": <nombre entre 0 et 100, réaliste selon le genre et ton>,
  "diagnostic": "diagnostic précis de 1-2 phrases",
  "weaknesses": ["faiblesse 1", "faiblesse 2"],
  "corrections": ["correction 1", "correction 2", "correction 3"],
  "suggestions": ["suggestion créative 1", "suggestion 2"],
  "trendNotes": "note sur les tendances actuelles pertinentes",
  "clicheRisk": "risque de cliché spécifique à éviter",
  "originalityOpportunity": "opportunité d'originalité concrète"
}

Les scores doivent être cohérents avec le genre "${project.genre}" et le ton "${project.tone}". Sois honnête — évite les scores trop élevés ou trop bas sans justification.`;

  const makeDefault = (score: number): ScoreCategory => ({
    score,
    diagnostic: "À évaluer",
    weaknesses: ["À identifier"],
    corrections: ["À définir"],
    suggestions: ["À développer"],
    trendNotes: "Tendances à analyser",
    clicheRisk: "Risques à identifier",
    originalityOpportunity: "Opportunités à explorer",
  });

  const fallback: Record<string, ScoreCategory> = {
    humour: makeDefault(50),
    pleur: makeDefault(65),
    suspense: makeDefault(70),
    attractivite: makeDefault(60),
    profondeurEmotionnelle: makeDefault(68),
    originalite: makeDefault(72),
    coherence: makeDefault(75),
  };

  return aiJson<Record<string, ScoreCategory>>(system, user, fallback);
}

// ---------------------------------------------------------------------------
// 9. Book Outline
// ---------------------------------------------------------------------------

export async function generateBookOutline(project: Project, matrix: NarrativeMatrix, emotionalCore: EmotionalCore, skillsContext?: string) {
  const system = `Tu es un éditeur littéraire et architecte de roman de haut niveau. Tu construis des plans de roman détaillés, cohérents et engageants. Tu travailles en français. Réponds UNIQUEMENT en JSON valide.`;

  const user = `Génère le plan complet du roman pour ce projet.

${projectContext(project)}

Logline : ${matrix.logline}
Synopsis court : ${matrix.shortPitch}
Protagoniste : ${matrix.protagonist}
Arc émotionnel : ${emotionalCore.transformationArc}

Génère un objet JSON :
{
  "titleIdeas": ["titre 1", "titre 2", "titre 3", "titre 4", "titre 5"],
  "backCoverPitch": "texte de quatrième de couverture complet (3-4 paragraphes)",
  "shortSynopsis": "synopsis court (1 paragraphe)",
  "longSynopsis": "synopsis long développé (4-5 paragraphes)",
  "tableOfContents": ["Partie I : ...", "Partie II : ...", "Partie III : ...", "Épilogue : ..."],
  "structure": "description de la structure narrative choisie et pourquoi",
  "chapters": [
    { "number": 1, "title": "titre du chapitre", "summary": "résumé détaillé du chapitre (3-4 phrases)" },
    ...jusqu'à 12 chapitres
  ]
}

Les titres de chapitres doivent être littéraires et significatifs. Les résumés doivent être précis et actionables pour l'auteur.`;

  const fallback = {
    titleIdeas: [project.title, "Sans titre 2", "Sans titre 3", "Sans titre 4", "Sans titre 5"],
    backCoverPitch: matrix.shortPitch,
    shortSynopsis: matrix.shortPitch,
    longSynopsis: matrix.longSynopsis,
    tableOfContents: ["Partie I", "Partie II", "Partie III", "Épilogue"],
    structure: "Structure en actes",
    chapters: [
      { number: 1, title: "Le début", summary: "Introduction du protagoniste" },
      { number: 2, title: "Le déclencheur", summary: "L'événement qui change tout" },
    ],
  };

  return aiJson(system, user, fallback);
}

// ---------------------------------------------------------------------------
// 10. Screenplay
// ---------------------------------------------------------------------------

export async function generateScreenplay(project: Project, matrix: NarrativeMatrix, emotionalCore: EmotionalCore, skillsContext?: string) {
  const system = `Tu es un scénariste professionnel formé aux meilleures écoles de cinéma, expert de la structure en beats, du format Fountain, et du développement de projets pour le marché français et international. Tu travailles en français. Réponds UNIQUEMENT en JSON valide.`;

  const user = `Génère la structure scénaristique complète pour ce projet.

${projectContext(project)}

Logline : ${matrix.logline}
Protagoniste : ${matrix.protagonist}
Antagoniste : ${matrix.antagonist}
Enjeux émotionnels : ${matrix.emotionalStakes}
Arc : ${emotionalCore.transformationArc}

Génère un objet JSON :
{
  "logline": "logline format industrie",
  "cinematicSynopsis": "synopsis cinématographique (2-3 paragraphes)",
  "treatment": "traitement complet (4-5 paragraphes avec directions visuelles)",
  "beats": [
    { "number": 1, "description": "IMAGE D'OUVERTURE : ..." },
    { "number": 2, "description": "THÈME ÉNONCÉ : ..." },
    { "number": 3, "description": "MISE EN PLACE : ..." },
    { "number": 4, "description": "DÉCLENCHEUR : ..." },
    { "number": 5, "description": "DÉBAT : ..." },
    { "number": 6, "description": "PASSAGE À L'ACTE : ..." },
    { "number": 7, "description": "SOUS-INTRIGUE : ..." },
    { "number": 8, "description": "AMUSEMENTS ET JEUX : ..." },
    { "number": 9, "description": "POINT MÉDIAN : ..." },
    { "number": 10, "description": "LES MÉCHANTS PROGRESSENT : ..." },
    { "number": 11, "description": "TOUT EST PERDU : ..." },
    { "number": 12, "description": "ÂME SOMBRE DE LA NUIT : ..." },
    { "number": 13, "description": "PERCÉE : ..." },
    { "number": 14, "description": "CLIMAX : ..." },
    { "number": 15, "description": "IMAGE FINALE : ..." }
  ],
  "scenes": [
    { "number": 1, "heading": "INT. LIEU - MOMENT", "description": "action de la scène (2-3 phrases)", "dialogueDraft": "dialogue en format Fountain ou vide" },
    { "number": 2, ... },
    { "number": 3, ... },
    { "number": 4, ... },
    { "number": 5, ... }
  ],
  "fountainScript": "script complet au format Fountain avec 5 scènes (utilisez les vraies balises Fountain : INT., EXT., noms de personnages en majuscules, parenthétiques)"
}`;

  const scenes = [
    { number: 1, heading: "INT. LIEU INITIAL - JOUR", description: "Introduction du protagoniste", dialogueDraft: "" },
    { number: 2, heading: "EXT. ESPACE DE TRANSITION - MÊME JOUR", description: "Le déclencheur", dialogueDraft: "" },
    { number: 3, heading: "INT. LIEU DU CONFLIT - NUIT", description: "Première confrontation", dialogueDraft: "" },
    { number: 4, heading: "INT. ESPACE INTIME - NUIT", description: "Le masque commence à peser", dialogueDraft: "" },
    { number: 5, heading: "EXT. LE SEUIL - AUBE", description: "Point de non-retour", dialogueDraft: "" },
  ];

  const fallback = {
    logline: matrix.logline,
    cinematicSynopsis: matrix.shortPitch,
    treatment: matrix.longSynopsis,
    beats: [
      { number: 1, description: "IMAGE D'OUVERTURE : Le monde du protagoniste" },
      { number: 2, description: "THÈME ÉNONCÉ : La vérité que le protagoniste refuse" },
    ],
    scenes,
    fountainScript: `Title: ${project.title}\nAuthor: [Auteur]\n\n${scenes.map(s => `${s.heading}\n\n${s.description}\n\n`).join("\n")}FONDU AU NOIR.\n\nFIN`,
  };

  return aiJson(system, user, fallback);
}

// ---------------------------------------------------------------------------
// 11. Series
// ---------------------------------------------------------------------------

export async function generateSeries(project: Project, matrix: NarrativeMatrix, emotionalCore: EmotionalCore, skillsContext?: string) {
  const system = `Tu es un showrunner et développeur de séries télévisées, expert du marché francophone et international, spécialisé dans la construction d'arcs long et de finales de saison. Tu travailles en français. Réponds UNIQUEMENT en JSON valide.`;

  const user = `Développe la structure de série pour ce projet.

${projectContext(project)}

Concept : ${matrix.centralConcept}
Arc émotionnel : ${emotionalCore.transformationArc}
Enjeux : ${matrix.emotionalStakes}

Génère un objet JSON :
{
  "format": "format précis (nombre d'épisodes, durée)",
  "seasonConcept": "concept de saison développé (2-3 paragraphes)",
  "longArcs": ["arc A : ...", "arc B : ...", "arc C : ..."],
  "episodes": [
    {
      "number": 1,
      "title": "titre de l'épisode",
      "summary": "résumé détaillé (3-4 phrases)",
      "cliffhanger": "cliffhanger précis et efficace",
      "emotionalEvolution": "évolution émotionnelle du protagoniste dans cet épisode"
    },
    ... (8 épisodes)
  ],
  "progressiveRevelations": ["révélation ep 1", "révélation ep 3", "révélation ep 5", "révélation ep 6", "révélation ep 8"],
  "secondaryCharacters": ["personnage secondaire 1", "personnage secondaire 2", "personnage secondaire 3"]
}`;

  const fallback = {
    format: "Série limitée — 8 épisodes de 45 minutes",
    seasonConcept: matrix.shortPitch,
    longArcs: ["Arc protagoniste", "Arc relation centrale", "Arc révélation du monde"],
    episodes: Array.from({ length: 8 }, (_, i) => ({
      number: i + 1,
      title: `Épisode ${i + 1}`,
      summary: "À développer",
      cliffhanger: "À définir",
      emotionalEvolution: "À préciser",
    })),
    progressiveRevelations: ["À définir par épisode"],
    secondaryCharacters: ["Le Témoin", "Le Passé Vivant", "L'Innocence"],
  };

  return aiJson(system, user, fallback);
}

// ---------------------------------------------------------------------------
// 12. Pitch
// ---------------------------------------------------------------------------

export async function generatePitch(project: Project, matrix: NarrativeMatrix, emotionalCore: EmotionalCore, skillsContext?: string) {
  const system = `Tu es un agent littéraire et consultant en développement créatif, expert dans la présentation de projets aux éditeurs, producteurs et chaînes. Tu maîtrises les codes du pitch français et international. Tu travailles en français. Réponds UNIQUEMENT en JSON valide.`;

  const user = `Génère le document de pitch professionnel complet pour ce projet.

${projectContext(project)}

Logline : ${matrix.logline}
Concept : ${matrix.centralConcept}
Émotion dominante : ${emotionalCore.dominantEmotion}
Protagoniste : ${matrix.protagonist}
Antagoniste : ${matrix.antagonist}

Génère un objet JSON :
{
  "title": "${project.title}",
  "format": "${project.targetFormat}",
  "genre": "${project.genre}",
  "targetAudience": "public cible précis avec démographie",
  "comparableReferences": ["référence comparable 1 (titre réel + pourquoi)", "référence comparable 2"],
  "visualDirection": "direction visuelle et esthétique détaillée (2-3 paragraphes)",
  "authorNote": "note d'auteur personnelle et engagée (2-3 paragraphes)",
  "intentionNote": "note d'intention artistique développée (2-3 paragraphes)",
  "whyNow": "argumentaire 'pourquoi maintenant' précis et convaincant",
  "characters": "présentation des personnages clés pour le pitch",
  "world": "présentation de l'univers pour le pitch",
  "filmSeasonArc": "arc saison/film développé pour le pitch",
  "sellingPoints": ["point de vente 1", "point de vente 2", "point de vente 3", "point de vente 4", "point de vente 5"]
}

Le pitch doit être convaincant, professionnel, et donner envie de lire/voir le projet. Utilise des références réelles et pertinentes.`;

  const fallback = {
    title: project.title,
    format: project.targetFormat,
    genre: project.genre,
    targetAudience: project.targetAudience ?? "Adultes 25-45 ans",
    comparableReferences: [`Dans la veine de [référence à définir] pour le genre ${project.genre}`],
    visualDirection: `Direction visuelle ${project.tone}`,
    authorNote: `Né de : ${project.rawIdea.slice(0, 100)}`,
    intentionNote: `Intention : ${project.artisticAmbition ?? "Créer une œuvre durable"}`,
    whyNow: `Ce projet répond à une demande culturelle actuelle`,
    characters: `${matrix.protagonist}\n\n${matrix.antagonist}`,
    world: `${matrix.visibleWorld}\n\n${matrix.invisibleForces}`,
    filmSeasonArc: matrix.longSynopsis.slice(0, 300),
    sellingPoints: [matrix.logline, `Profondeur émotionnelle rare dans le genre ${project.genre}`],
  };

  return aiJson(system, user, fallback);
}

// ---------------------------------------------------------------------------
// 13. Coherence check (synchrone — analyse locale, pas besoin d'IA)
// ---------------------------------------------------------------------------

export function checkCoherence(matrix: NarrativeMatrix): { score: number; issues: string[]; suggestions: string[]; isCoherent: boolean } {
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (!matrix.centralConcept) issues.push("Le concept central n'est pas défini");
  if (!matrix.protagonist) issues.push("Le protagoniste n'est pas développé");
  if (!matrix.antagonist) issues.push("La force d'opposition n'est pas définie");
  if (matrix.themes.length < 2) issues.push("Au moins 2 thèmes doivent être définis pour assurer la cohérence");
  if (matrix.universeLaws.length === 0) issues.push("Les lois de l'univers ne sont pas définies — risque d'incohérence narrative");
  if (!matrix.emotionalStakes) issues.push("Les enjeux émotionnels ne sont pas clairement formulés");

  if (matrix.protagonist && matrix.antagonist && matrix.centralConflict) {
    suggestions.push("Vérifier que la résolution du protagoniste et de l'antagoniste sont vraiment irréductibles");
  }
  if (matrix.secrets.length > 0) {
    suggestions.push("S'assurer que chaque secret a été préparé par au moins 3 indices visibles en amont");
  }
  if (matrix.possibleEndings.length > 1) {
    suggestions.push("Vérifier que toutes les fins possibles sont cohérentes avec l'arc émotionnel établi");
  }
  suggestions.push("Test de cohérence : si vous retirez un personnage, le récit s'effondre-t-il ? Sinon, ce personnage est en trop.");

  const score = Math.max(40, 100 - issues.length * 15 + suggestions.length * 2);
  return {
    score: Math.min(100, score),
    issues,
    suggestions,
    isCoherent: issues.length === 0,
  };
}
