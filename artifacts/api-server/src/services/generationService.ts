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
  manuscriptExcerpt?: string | null;
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
  if (project.manuscriptExcerpt) extras.push(`Extrait de manuscrit / brouillon de l'auteur (style naturel, voix propre) :\n"""\n${project.manuscriptExcerpt.slice(0, 1200)}\n"""`);

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

// ---------------------------------------------------------------------------
// Auto-link skills
// ---------------------------------------------------------------------------

export async function autoLinkSkills(
  project: Project,
  availableSkills: Array<{ id: string; name: string; category: string; description: string; isUniversal: boolean; validationCount: number }>
): Promise<string[]> {
  if (!availableSkills.length) return [];

  const system = `Tu es un expert en techniques narratives et en pédagogie créative. À partir du projet d'un auteur, tu identifies les compétences narratives les plus pertinentes à activer. Réponds UNIQUEMENT en JSON valide.`;

  const skillsList = availableSkills
    .map(s => `{"id":"${s.id}","name":"${s.name}","category":"${s.category}","isUniversal":${s.isUniversal},"validations":${s.validationCount}}`)
    .join("\n");

  const hasManuscript = !!project.manuscriptExcerpt;
  const hasMoods = (project.visualMoods as string[] | undefined)?.length;

  const user = `Voici un projet créatif :

${projectContext(project)}

Compétences narratives disponibles dans la bibliothèque :
${skillsList}

${hasManuscript ? "IMPORTANT : L'auteur a fourni un extrait de manuscrit. Priorise les compétences qui correspondent au style d'écriture naturel détecté et aux techniques déjà présentes ou manquantes." : ""}
${hasMoods ? "IMPORTANT : L'auteur a déclaré des atmosphères visuelles précises. Priorise les compétences qui renforcent l'identité visuelle et sensorielle du projet." : ""}

Sélectionne exactement 3 à 5 compétences les plus pertinentes pour ce projet. Choisis celles qui :
1. Correspondent au genre et au ton déclarés
2. Complètent ou renforcent les intentions créatives
3. Sont marquées isUniversal:true en priorité (validées cross-culturellement)

Réponds UNIQUEMENT avec cet objet JSON :
{"selectedIds": ["id1", "id2", "id3"]}

N'invente pas d'IDs. Utilise uniquement des IDs de la liste ci-dessus.`;

  const fallback = { selectedIds: [] as string[] };
  const result = await aiJson<{ selectedIds: string[] }>(system, user, fallback);
  const validIds = availableSkills.map(s => s.id);
  return result.selectedIds.filter(id => validIds.includes(id));
}

// ---------------------------------------------------------------------------
// Tension Arc
// ---------------------------------------------------------------------------

export async function generateTensionArc(project: Project, matrixData: NarrativeMatrix | null): Promise<{
  acts: Array<{ label: string; description: string; tension: number; emotion: string; keyEvent: string }>;
  overallShape: string;
  recommendation: string;
}> {
  const system = `Tu es un dramaturge expert en structure narrative et en courbes de tension. Tu analyses des projets créatifs et génères des arcs de tension précis, nuancés, évitant les schémas convenus. Réponds UNIQUEMENT en JSON valide.`;
  const user = `${projectContext(project)}
${matrixData ? `Matrice : logline="${matrixData.logline}", conflit="${matrixData.centralConflict}", thèmes=${matrixData.themes?.join(", ")}` : ""}

Génère une courbe de tension dramatique avec 8 à 10 séquences. Chaque point a une valeur tension entre 0 et 100.

{"acts":[{"label":"Nom évocateur de la séquence","description":"Ce qui se passe narrativement","tension":35,"emotion":"Émotion dominante ressentie par le lecteur","keyEvent":"L'événement pivot concret"}],"overallShape":"Description poétique de la forme de la courbe","recommendation":"Conseil précis pour améliorer le rythme dramatique"}`;
  const fallback = {
    acts: [
      { label: "L'Avant", description: "Le monde avant la rupture", tension: 15, emotion: "Sérénité fragile", keyEvent: "Un équilibre qui sera brisé" },
      { label: "L'Incident", description: "Ce qui déclenche tout", tension: 40, emotion: "Surprise", keyEvent: "Le monde du personnage bascule" },
      { label: "La Résistance", description: "Le protagoniste refuse l'appel", tension: 35, emotion: "Hésitation", keyEvent: "Premier refus, premier doute" },
      { label: "L'Engagement", description: "Point de non-retour", tension: 60, emotion: "Détermination mêlée de peur", keyEvent: "Décision irréversible prise" },
      { label: "La Montée", description: "Les obstacles s'accumulent", tension: 72, emotion: "Pression croissante", keyEvent: "Chaque solution crée un nouveau problème" },
      { label: "La Crise du Milieu", description: "Tout semble perdu", tension: 55, emotion: "Désespoir et remise en question", keyEvent: "Le personnage perd ce qu'il croit vouloir" },
      { label: "La Révélation", description: "La vérité éclate", tension: 80, emotion: "Choc et lucidité", keyEvent: "Ce que le personnage a toujours fui lui fait face" },
      { label: "Le Climax", description: "Confrontation ultime", tension: 95, emotion: "Terreur et catharsis", keyEvent: "Le moment de vérité — qui sera-t-il vraiment ?" },
      { label: "La Résolution", description: "Le nouveau monde", tension: 30, emotion: "Mélancolie douce", keyEvent: "Ce qui a changé pour toujours" },
    ],
    overallShape: "Courbe en vallée-montagne — creux au milieu, double pic",
    recommendation: "Votre creux de milieu est fort. Assurez-vous que la révélation change la perception de tout ce qui précède.",
  };
  return aiJson(system, user, fallback);
}

// ---------------------------------------------------------------------------
// Atmosphere / Mood Board
// ---------------------------------------------------------------------------

export async function generateAtmosphere(project: Project): Promise<{
  colorPalette: Array<{ name: string; hex: string; role: string }>;
  lightingStyle: string;
  musicReferences: Array<{ genre: string; artists: string[]; mood: string }>;
  cinematicStyle: string;
  textures: string[];
  sensoryNotes: { smell: string; sound: string; touch: string };
  visualReferences: string[];
}> {
  const system = `Tu es un directeur artistique de haut niveau, spécialiste des univers sensoriels cinématographiques et littéraires. Tu crées des chambres d'atmosphère cohérentes, originales, loin des clichés de genre. Réponds UNIQUEMENT en JSON valide.`;
  const moods = (project.visualMoods as string[] | undefined)?.join(", ") || "non spécifié";
  const user = `${projectContext(project)}
Atmosphères visuelles déclarées : "${moods}"

Génère une chambre des atmosphères complète et précise.

{"colorPalette":[{"name":"Nom poétique","hex":"#hexcode","role":"Rôle dramatique dans l'univers"}],"lightingStyle":"Direction lumière, qualité photographique, style visuel","musicReferences":[{"genre":"Genre musical précis","artists":["Artiste 1","Artiste 2"],"mood":"Ce que cette musique apporte émotionnellement"}],"cinematicStyle":"Style cinéma de référence et pourquoi ce choix est juste","textures":["5 à 7 matières et textures physiquement présentes dans l'univers"],"sensoryNotes":{"smell":"Odeurs dominantes","sound":"Paysage sonore ambiant","touch":"Sensations tactiles et température ressentie"},"visualReferences":["6 à 8 films, séries, photographes, peintres ou artistes de référence"]}

Palette : 5 à 7 couleurs. Sois précis, poétique et inattendu. Pas de clichés.`;
  const fallback = {
    colorPalette: [
      { name: "Ébène Nocturne", hex: "#0a0809", role: "Fond dominant — l'espace du silence" },
      { name: "Violet Blessure", hex: "#3b0764", role: "Accent dramatique — la douleur intérieure" },
      { name: "Bleu Mercure", hex: "#1e3a5f", role: "Profondeur — ce qui est caché sous la surface" },
      { name: "Ambre Trouble", hex: "#92400e", role: "Chaleur distante — souvenirs et nostalgie" },
      { name: "Blanc Cassé", hex: "#f5f0eb", role: "Lumière rare — les moments de grâce" },
    ],
    lightingStyle: "Chiaroscuro contemporain. Sources uniques, ombres dures. Nuits urbaines, halos de lampadaires.",
    musicReferences: [
      { genre: "Ambient Noir", artists: ["Burial", "Grouper"], mood: "Mélancolie et tension diffuse" },
      { genre: "Post-classique", artists: ["Ólafur Arnalds", "Nils Frahm"], mood: "Fragilité émotionnelle" },
    ],
    cinematicStyle: "Néo-noir psychologique — héritage de Lynch, épure de Haneke",
    textures: ["Béton humide", "Verre dépoli", "Cuir vieilli", "Tissu froissé", "Métal oxydé"],
    sensoryNotes: { smell: "Pluie sur l'asphalte chaud, cigarette froide", sound: "Bourdonnement lointain, silence dense", touch: "Froid sec, surface rugueuse" },
    visualReferences: ["Drive (2011)", "True Detective S1", "Blade Runner 2049", "Caché (Haneke)", "La Pianiste"],
  };
  return aiJson(system, user, fallback);
}

// ---------------------------------------------------------------------------
// Director Mode — technical scene breakdown
// ---------------------------------------------------------------------------

export async function generateDirectorMode(
  project: Project,
  passage: string
): Promise<{
  sceneTitle: string;
  overallMood: string;
  colorGrading: string;
  productionNote: string;
  shots: Array<{
    index: number;
    excerpt: string;
    planType: string;
    cameraMovement: string;
    lens: string;
    lighting: string;
    soundDesign: string;
    editingRhythm: string;
    mood: string;
    directorNote: string;
  }>;
}> {
  const system = `Tu es un réalisateur de cinéma de niveau international — précis, visionnaire, technique. 
Tu lis des passages d'œuvres et tu génères une découpe technique complète comme si tu allais tourner cette scène demain.
Réponds UNIQUEMENT en JSON valide. Sois précis, concret, non-académique — comme un carnet de tournage réel.`;

  const user = `${projectContext(project)}

PASSAGE À DÉCOUPER :
"""
${passage.slice(0, 1500)}
"""

Génère une découpe technique de réalisateur pour ce passage. Décompose en 3 à 6 plans/moments clés.

{
  "sceneTitle": "Titre cinématographique évocateur pour cette scène",
  "overallMood": "L'humeur émotionnelle dominante de la scène en 1 phrase",
  "colorGrading": "Direction colorimétrique — température, contraste, saturation, références",
  "productionNote": "Note globale de mise en scène — ce qui rend cette scène unique et puissante",
  "shots": [
    {
      "index": 1,
      "excerpt": "Courte citation ou description du moment précis couvert par ce plan",
      "planType": "Type de plan exact (Très gros plan, Gros plan, Plan rapproché épaules, Plan taille, Plan américain, Plan moyen, Plan d'ensemble, Grand ensemble, etc.)",
      "cameraMovement": "Mouvement caméra précis (Fixe, Panoramique horizontal, Travelling avant/arrière/latéral, Zoom, Steadicam, Caméra à l'épaule, Grue, Drone, etc.)",
      "lens": "Longueur focale et justification (ex: 85mm — compression douce, regard intime)",
      "lighting": "Description lumière : source, qualité, direction, ambiance",
      "soundDesign": "Son direct, ambiance, musique, silence — ce qu'on entend et pourquoi",
      "editingRhythm": "Type de coupe et durée estimée du plan (ex: Coupe sèche — 3s, Fondu enchaîné — 8s)",
      "mood": "Émotion que ce plan doit provoquer chez le spectateur",
      "directorNote": "Note personnelle du réalisateur — l'intention secrète, ce qui doit être ressenti"
    }
  ]
}

Sois technique ET poétique. Chaque plan doit avoir une raison d'être dramatique précise.`;

  const fallback = {
    sceneTitle: "Scène sans titre — analysez le passage",
    overallMood: "Tension latente, silence chargé de non-dit",
    colorGrading: "Tons froids désaturés, hautes lumières légèrement brûlées, ombres profondes",
    productionNote: "Laisser le silence travailler. Éviter la surexplication. La caméra observe, elle ne commente pas.",
    shots: [
      {
        index: 1,
        excerpt: "Ouverture de la scène",
        planType: "Plan d'ensemble",
        cameraMovement: "Fixe — légère vibration d'un Steadicam",
        lens: "35mm — légère distorsion, sentiment d'espace oppressant",
        lighting: "Lumière naturelle diffuse, contre-jour doux",
        soundDesign: "Ambiance extérieure lointaine, silence intérieur pesant",
        editingRhythm: "Maintien long — 6 à 8 secondes",
        mood: "Inquiétude sourde, attente",
        directorNote: "On installe. Le spectateur doit sentir qu'il se passe quelque chose — sans savoir quoi encore.",
      },
    ],
  };

  return aiJson(system, user, fallback);
}

// ---------------------------------------------------------------------------
// Écho du Temps — mythic/historical/cross-cultural resonances
// ---------------------------------------------------------------------------

export async function generateEchoDuTemps(project: Project): Promise<{
  mythicResonances: Array<{ myth: string; culture: string; connection: string }>;
  historicalParallels: Array<{ period: string; region: string; connection: string }>;
  culturalEchoes: Array<{ culture: string; storyTitle: string; connection: string }>;
  temporalAnchor: string;
  universalWound: string;
  futureResonance: string;
}> {
  const system = `Tu es un archiviste universel et un anthropologue des récits. Tu explores comment les histoires traversent les cultures, les siècles et les civilisations. Tu trouves les liens profonds — pas les ressemblances superficielles. Réponds UNIQUEMENT en JSON valide.`;
  const user = `${projectContext(project)}

Cette histoire vibre avec quels mythes anciens, quels événements historiques, quelles traditions narratives du monde ?

{
  "mythicResonances": [
    { "myth": "Nom du mythe ou archétype", "culture": "Culture d'origine", "connection": "Lien profond et non évident avec cette histoire — ce qui les unit au niveau de l'âme" }
  ],
  "historicalParallels": [
    { "period": "Période historique précise", "region": "Région du monde", "connection": "Ce que ce moment historique partage émotionnellement avec cette histoire" }
  ],
  "culturalEchoes": [
    { "culture": "Culture ou tradition", "storyTitle": "Titre d'une œuvre, conte, ou récit de cette culture", "connection": "Ce lien invisible qui unit ces deux histoires à travers le temps" }
  ],
  "temporalAnchor": "À quelle époque spirituelle appartient cette histoire — non pas où elle se passe, mais d'où elle vient émotionnellement",
  "universalWound": "La blessure humaine universelle que cette histoire soigne ou explore — ce qui en fait une histoire pour tous et toujours",
  "futureResonance": "Comment cette histoire parlera aux générations futures, ce qu'elle leur dira de nous"
}

Sois précis, inattendu, non-académique. Pas de parallèles évidents — cherche les résonances profondes. 3 de chaque liste.`;

  const fallback = {
    mythicResonances: [
      { myth: "Prométhée", culture: "Grecque antique", connection: "Celui qui porte le feu pour les autres et se brûle lui-même — la solitude du porteur de lumière" },
      { myth: "La Femme Araignée (Spider Woman)", culture: "Hopi / Navajo", connection: "Tisseuse invisible de réalités, celle dont le travail ordonne le monde sans être vu" },
      { myth: "Gilgamesh et Enkidu", culture: "Mésopotamie", connection: "L'amitié qui seule permet d'affronter l'impossible — et sa perte qui révèle tout" },
    ],
    historicalParallels: [
      { period: "Résistance française 1940-44", region: "France occupée", connection: "Vivre sous un régime qui efface votre identité — la résistance silencieuse et intérieure" },
      { period: "Harlem Renaissance, années 1920", region: "États-Unis", connection: "Créer une culture entière sous la menace d'anéantissement — l'art comme survie" },
      { period: "Transition post-apartheid, 1994-2000", region: "Afrique du Sud", connection: "Construire l'avenir sans oublier le passé — la mémoire comme acte politique" },
    ],
    culturalEchoes: [
      { culture: "Japonaise", storyTitle: "La princesse Kaguya (Taketori Monogatari)", connection: "Appartenir à deux mondes sans pouvoir habiter pleinement aucun des deux" },
      { culture: "Malienne (Mandé)", storyTitle: "L'épopée de Soundiata Keïta", connection: "La force cachée dans la faiblesse apparente — la victoire qui vient de l'intérieur" },
      { culture: "Russe", storyTitle: "L'Idiot de Dostoïevski", connection: "La pureté absolue comme forme de violence involontaire contre un monde corrompu" },
    ],
    temporalAnchor: "Cette histoire appartient aux heures d'avant l'aube — quand tout peut encore basculer dans les deux sens",
    universalWound: "La peur d'être vu tel qu'on est vraiment — et d'être rejeté pour ça",
    futureResonance: "Les générations futures y liront notre époque comme celle où l'on a choisi entre ce qui est facile et ce qui est juste",
  };
  return aiJson(system, user, fallback);
}

// ---------------------------------------------------------------------------
// Miroir Artistique — poetic artistic reflection (not correction)
// ---------------------------------------------------------------------------

export async function generateMiroirArtistique(project: Project): Promise<{
  trueTheme: string;
  shadowStory: string;
  blindSpots: string[];
  resonanceGaps: Array<{ zone: string; reflection: string }>;
  artisticInvitations: Array<{ invitation: string; why: string }>;
  mirrorPhrase: string;
}> {
  const system = `Tu es un mentor artistique rare — tu ne corriges jamais directement, tu réfléchis. Comme un miroir intelligent, tu montres à l'auteur ce qu'il écrit sans le savoir, ce qui est fort sans qu'il le voie, et tu poses des invitations poétiques là où l'œuvre peut s'ouvrir encore. Tu ne dis jamais "c'est mal" ou "tu dois". Tu murmures. Tu interroges. Réponds UNIQUEMENT en JSON valide.`;
  const user = `${projectContext(project)}

Lis cette œuvre en profondeur et réfléchis-la à l'auteur comme un miroir.

{
  "trueTheme": "Le vrai sujet de cette œuvre — non pas le sujet déclaré, mais ce dont elle parle vraiment, en profondeur",
  "shadowStory": "L'histoire que l'auteur écrit sans le savoir — la narrative souterraine qui pulse sous la surface",
  "blindSpots": ["Ce que l'auteur ne voit peut-être pas dans son propre travail — formulé avec douceur et curiosité, jamais comme un jugement"],
  "resonanceGaps": [
    { "zone": "Zone de l'œuvre ou aspect narratif", "reflection": "Ce que cette zone dit réellement — son potentiel non encore exploré, formulé comme une question ou une observation poétique" }
  ],
  "artisticInvitations": [
    { "invitation": "Et si... / Que se passerait-il si... / Il y a peut-être ici...", "why": "Pourquoi cette invitation pourrait ouvrir quelque chose d'essentiel" }
  ],
  "mirrorPhrase": "Une seule phrase poétique qui reflète l'essence entière de cette œuvre — comme un titre secret que l'auteur ne savait pas qu'il cherchait"
}

Sois bienveillant, précis, non évident. 3 blindSpots, 3 resonanceGaps, 4 artisticInvitations. Jamais de "vous devriez". Toujours "et si", "peut-être", "il y a ici quelque chose de...".`;

  const fallback = {
    trueTheme: "Ce que cette œuvre explore vraiment, c'est la question de ce qu'on est prêt à perdre pour rester soi-même",
    shadowStory: "Sous l'histoire racontée, il y a celle d'un enfant qui cherche à être vu — et qui a appris à se rendre invisible pour survivre",
    blindSpots: [
      "Il y a peut-être ici une tendance à protéger les personnages des conséquences les plus douloureuses de leurs choix",
      "La voix narrative hésite parfois à entrer dans les silences — là où se cache pourtant l'essentiel",
      "Les moments de légèreté sont peut-être trop tôt interrompus — comme si la joie faisait peur autant que la douleur",
    ],
    resonanceGaps: [
      { zone: "Les relations secondaires", reflection: "Elles portent peut-être un amour que le récit principal n'ose pas encore nommer" },
      { zone: "Les fins de scènes", reflection: "Il y a souvent là un mot de trop — ou un silence de trop peu. Quelque chose attend" },
      { zone: "Le corps des personnages", reflection: "Il parle moins que l'esprit. Et pourtant le corps sait des choses que les mots refusent" },
    ],
    artisticInvitations: [
      { invitation: "Et si le personnage le plus silencieux portait la clé de tout ?", why: "Ceux qu'on n'écoute pas disent souvent le vrai" },
      { invitation: "Que se passerait-il si une scène clé se passait entièrement dans le passé ?", why: "Le présent de cette histoire semble hanter par quelque chose qui n'a pas encore été dit" },
      { invitation: "Il y a peut-être ici un humour qui n'ose pas encore se montrer", why: "La légèreté est une forme de courage — et elle rend la douleur encore plus vraie" },
      { invitation: "Et si la dernière image était aussi la première ?", why: "Cette histoire a peut-être la forme d'un cercle qu'elle ne sait pas encore refermer" },
    ],
    mirrorPhrase: "Une histoire sur les distances qu'on met entre soi et ce qu'on aime — et le chemin qu'on ne prend jamais assez tôt pour les traverser.",
  };
  return aiJson(system, user, fallback);
}

// ---------------------------------------------------------------------------
// Les 5 Piliers — humor / suspense / emotion / tenderness / surprise
// ---------------------------------------------------------------------------

export async function generateCinqPiliers(project: Project): Promise<{
  pillars: Array<{ name: string; presence: number; type: string; analysis: string; strongMoment: string; artisticSuggestion: string }>;
  dominantPillar: string;
  weakestPillar: string;
  globalBalance: string;
}> {
  const system = `Tu es un dramaturge et analyste narratif de haut niveau. Tu analyses comment les 5 grands piliers émotionnels d'une œuvre — Humour, Suspense, Émotion, Tendresse, Surprise — sont présents, équilibrés, et comment chacun peut être approfondi artistiquement. Tu es précis, non académique, et tu respectes la vision de l'auteur. Réponds UNIQUEMENT en JSON valide.`;
  const user = `${projectContext(project)}

Analyse les 5 piliers dramatiques fondamentaux de cette œuvre.

{
  "pillars": [
    {
      "name": "Humour",
      "presence": 0,
      "type": "Type d'humour présent ou absent (absurde, noir, tendresse comique, autodérision, ironie, décalage...)",
      "analysis": "Analyse précise de la présence et la qualité de ce pilier dans cette œuvre",
      "strongMoment": "Moment ou aspect de l'œuvre où ce pilier est ou pourrait être le plus fort",
      "artisticSuggestion": "Une suggestion artistique non-directive pour approfondir ce pilier — formulée comme une invitation"
    },
    { "name": "Suspense", "presence": 0, "type": "...", "analysis": "...", "strongMoment": "...", "artisticSuggestion": "..." },
    { "name": "Émotion", "presence": 0, "type": "...", "analysis": "...", "strongMoment": "...", "artisticSuggestion": "..." },
    { "name": "Tendresse", "presence": 0, "type": "...", "analysis": "...", "strongMoment": "...", "artisticSuggestion": "..." },
    { "name": "Surprise", "presence": 0, "type": "...", "analysis": "...", "strongMoment": "...", "artisticSuggestion": "..." }
  ],
  "dominantPillar": "Le pilier le plus fort et naturellement présent dans cette œuvre",
  "weakestPillar": "Le pilier le moins développé — formulé avec bienveillance",
  "globalBalance": "Analyse d'ensemble de l'équilibre dramatique — ce qui rend cette œuvre unique et ce qui pourrait la rendre encore plus universelle"
}

presence = score de 0 à 100. Sois honnête mais bienveillant.`;

  const fallback = {
    pillars: [
      { name: "Humour", presence: 35, type: "Ironie douce, décalage situationnel", analysis: "L'humour est présent en filigrane mais souvent étouffé par la gravité du propos. Il y a des moments de légèreté naturelle qui mériteraient d'être libérés davantage.", strongMoment: "Dans les dialogues entre personnages secondaires — là où la vérité se dit avec un sourire", artisticSuggestion: "Et si un personnage avait le droit d'être franchement drôle, même dans les moments difficiles ?" },
      { name: "Suspense", presence: 70, type: "Suspense psychologique, tension relationnelle", analysis: "Le suspense est bien construit, surtout au niveau des relations et des secrets. La tension monte de façon organique.", strongMoment: "Dans les scènes où un personnage sait quelque chose que l'autre ignore encore", artisticSuggestion: "Le suspense pourrait être encore plus fort si le lecteur avait une information que les personnages n'ont pas" },
      { name: "Émotion", presence: 80, type: "Émotion contenue, intérieure, rarement exprimée directement", analysis: "L'émotion est le moteur principal de l'œuvre. Elle est souvent retenue — ce qui la rend d'autant plus puissante quand elle éclate.", strongMoment: "Dans les moments de séparation et de perte — physique ou symbolique", artisticSuggestion: "Que se passerait-il si un personnage laissait l'émotion déborder là où on l'attend le moins ?" },
      { name: "Tendresse", presence: 55, type: "Tendresse silencieuse, gestes plutôt que mots", analysis: "La tendresse est présente mais souvent cachée derrière la distance et la pudeur des personnages. C'est une force discrète mais réelle.", strongMoment: "Dans les petits gestes quotidiens entre personnages qui s'aiment sans le dire", artisticSuggestion: "Il y a peut-être ici une scène entière de pure tendresse qui attend d'être écrite" },
      { name: "Surprise", presence: 45, type: "Révélations de caractère plus que de plot", analysis: "La surprise opère surtout au niveau de la profondeur des personnages. Les retournements de situation pourraient être plus audacieux.", strongMoment: "Quand un personnage agit à l'inverse de ce qu'on attendait de lui — et que ça révèle tout", artisticSuggestion: "Et si la plus grande surprise de l'histoire était quelque chose de minuscule et pas un grand coup de théâtre ?" },
    ],
    dominantPillar: "Émotion",
    weakestPillar: "Humour — non pas par manque de talent, mais peut-être par prudence vis-à-vis de la profondeur du sujet",
    globalBalance: "Cette œuvre a la solidité d'une construction émotionnelle forte et un suspense réel. Pour atteindre l'universel, elle pourrait oser davantage la légèreté et la surprise — car ce sont eux qui permettent à la douleur d'être vraiment supportée et partagée.",
  };
  return aiJson(system, user, fallback);
}

// ---------------------------------------------------------------------------
// Note d'Intention Cinématographique
// ---------------------------------------------------------------------------

export async function generateNoteIntention(
  project: Project,
  matrix?: Partial<NarrativeMatrix> | null
): Promise<{
  vision: string;
  partiPrisMiseEnScene: string;
  personnagesVision: Array<{ nom: string; visionRealisateur: string }>;
  universVisuel: string;
  musiqueEtSon: string;
  positionnement: string;
  pourquoiMaintenant: string;
  motFinal: string;
}> {
  const system = `Tu es un cinéaste de haut niveau — à la fois auteur et réalisateur — qui rédige sa note d'intention pour présenter son projet à des producteurs, au CNC, et à des festivals de cinéma d'auteur.
Tu écris à la PREMIÈRE PERSONNE SINGULIÈRE, comme si c'était le réalisateur qui parle directement.
Le ton est personnel, engagé, littéraire sans être précieux. Pas de jargon académique. 
Chaque phrase doit avoir le poids d'une conviction profonde.
Tu ne décris pas le film — tu expliques POURQUOI tu dois le faire, COMMENT tu le vois, CE QU'IL DIT du monde.
Réponds UNIQUEMENT en JSON valide, sans markdown.`;

  const user = `Rédige une note d'intention cinématographique complète et de haut niveau pour ce projet :

Titre : ${project.title}
Idée originale : ${project.rawIdea}
Genre : ${project.genre} | Ton : ${project.tone} | Format : ${project.targetFormat}
${matrix?.logline ? `Logline : ${matrix.logline}` : ""}
${matrix?.longSynopsis ? `Synopsis : ${matrix.longSynopsis.slice(0, 500)}` : ""}
${matrix?.centralConflict ? `Conflit central : ${matrix.centralConflict}` : ""}
${matrix?.protagonist ? `Protagoniste : ${matrix.protagonist}` : ""}
${matrix?.themes?.length ? `Thèmes : ${matrix.themes.join(", ")}` : ""}
${matrix?.emotionalStakes ? `Enjeux émotionnels : ${matrix.emotionalStakes}` : ""}
${project.artisticAmbition ? `Ambition artistique : ${project.artisticAmbition}` : ""}
${project.cinematicReferences ? `Références cinématographiques : ${project.cinematicReferences}` : ""}
${project.targetAudience ? `Public visé : ${project.targetAudience}` : ""}

Rédige chaque section comme un texte continu de qualité éditoriale — pas une liste, pas de bullet points.
Chaque section doit faire 3 à 6 phrases. La "vision" peut être plus longue (6-10 phrases).
Le "motFinal" est une phrase unique, forte, personnelle — presque une déclaration.

Format JSON :
{
  "vision": "Paragraphe personnel : pourquoi CE film, quelle obsession vous habite, ce que vous ne pouvez pas ne pas faire",
  "partiPrisMiseEnScene": "Comment vous voulez filmer — distance, proximité, mouvement, lumière, rythme, rapport au temps",
  "personnagesVision": [
    { "nom": "Prénom du personnage", "visionRealisateur": "Comment le réalisateur voit ce personnage — sa vérité, ce qu'il représente, pourquoi il est irremplaçable" }
  ],
  "universVisuel": "L'atmosphère visuelle — couleurs, textures, références cinématographiques précises, ce que l'œil doit ressentir",
  "musiqueEtSon": "Approche sonore et musicale — ambiances, silence, choix de son direct ou non, rapport à la musique",
  "positionnement": "Où ce film se situe dans le cinéma d'aujourd'hui — ce qu'il dit que peu de films disent, son rapport à la tradition et à la modernité",
  "pourquoiMaintenant": "Urgence — pourquoi 2025-2026, ce que le monde traverse qui rend ce film nécessaire précisément maintenant",
  "motFinal": "Une phrase finale, personnelle, qui dit l'essentiel en peu de mots"
}

Mets 2 à 4 personnages dans personnagesVision (les plus importants).
Écris avec la voix d'un cinéaste qui a quelque chose d'urgent à dire.`;

  const fallback = {
    vision: `Ce film est né d'une question que je ne parviens pas à taire : pourquoi certaines personnes choisissent-elles de se taire précisément quand leur parole pourrait tout changer ? "${project.title}" n'est pas une enquête sur ce silence — c'est une plongée dans sa matière, sa texture, sa logique intérieure. J'ai passé des années à observer des gens capables d'une loyauté absolue envers quelque chose qui les détruit. Je ne voulais pas les juger. Je voulais comprendre de l'intérieur ce que ça coûte de tenir. Ce film est ma tentative de filmer ce coût-là — invisible, quotidien, dévastateur.`,
    partiPrisMiseEnScene: `Je veux filmer au plus près des corps et des visages, mais sans les enfermer. Une caméra portée à l'épaule qui respire, qui hésite parfois — comme si elle cherchait elle aussi. Beaucoup de plans séquences qui laissent le temps s'installer. Je refuse le montage comme démonstration : chaque coupe sera une nécessité, pas une ponctuation. La mise en scène sera celle du regard qui attend que les choses se révèlent d'elles-mêmes.`,
    personnagesVision: [
      { nom: "Le protagoniste", visionRealisateur: "Ce personnage est celui qui porte le film dans son corps. Pas un héros — quelqu'un d'ordinaire qui se retrouve face à l'impossible. Ce qui m'intéresse en lui, c'est l'espace entre ce qu'il sait et ce qu'il est capable d'admettre. Cet espace-là, c'est tout le film." },
      { nom: "La figure antagoniste", visionRealisateur: "Je ne veux pas en faire un méchant. Il a ses raisons, sa logique, sa propre vision du monde — et c'est précisément ce qui le rend dangereux. Le vrai conflit n'est pas entre ces deux personnages : c'est entre deux façons d'être humain face à la même réalité." },
    ],
    universVisuel: `Le film se construira dans des tons désaturés — gris bleutés, ocres fanés, lumières naturelles poussées dans leurs limites. Je pense aux films de Haneke pour leur façon de laisser respirer l'image sans jamais l'embellir. Mais aussi à Chantal Akerman — cette capacité à rendre les espaces domestiques à la fois familiers et profondément étranges. Le cadre sera rigoureux, parfois asymétrique, laissant du vide là où on attendrait du plein.`,
    musiqueEtSon: `Son direct, autant que possible — l'ambiance des lieux, les bruits du monde, la respiration des acteurs. La musique sera rare et elle ne commentera jamais : quand elle viendra, ce sera pour dire quelque chose que les images et les mots ne peuvent pas. Je travaillerai avec un compositeur qui connaît le silence autant que les notes.`,
    positionnement: `Ce film s'inscrit dans une tradition du cinéma d'auteur européen qui fait confiance au spectateur — qui ne lui explique pas ce qu'il doit ressentir. Dans un paysage audiovisuel saturé d'effets et de vitesse, je veux proposer le contraire : la lenteur comme résistance, l'ambiguïté comme respect. Ce film a sa place dans les festivals de cinéma indépendant qui défendent encore l'idée que le cinéma peut changer quelque chose à notre façon de voir.`,
    pourquoiMaintenant: `Nous vivons dans un monde où la parole est partout et le silence nulle part. Paradoxalement, les gens n'ont jamais été aussi seuls avec ce qu'ils ne peuvent pas dire. "${project.title}" parle de ça — de ce qui ne trouve pas de forme, de ce qui reste en suspens. En 2025, cette question n'est pas une métaphore : elle est la condition réelle d'une majorité de gens. Ce film est une réponse cinématographique à cette réalité.`,
    motFinal: `Je fais ce film parce qu'il y a des choses qui ne peuvent exister que dans une salle obscure, entre des inconnus qui respirent ensemble dans le noir.`,
  };

  return aiJson(system, user, fallback);
}

// ---------------------------------------------------------------------------
// Séquencier — professional cinematic sequence breakdown
// ---------------------------------------------------------------------------

export async function generateSequencier(
  project: Project,
  matrix?: Partial<NarrativeMatrix> | null
): Promise<{
  sequences: Array<{
    numero: number; titre: string; lieu: string; moment: string;
    personnages: string[]; fonctionDramatique: string; arcEmotionnel: string;
    dureeEstimee: number; liensThematiques: string; noteRealisateur: string;
  }>;
  totalDuree: number;
  structure: string;
  noteGlobale: string;
}> {
  const system = `Tu es un dramaturge et scénariste professionnel de haut niveau, spécialiste du cinéma d'auteur contemporain.
Tu génères des SÉQUENCIERS professionnels — le document de référence qui précède l'écriture du scénario.
Tu travailles à la manière des grandes écoles de cinéma (La Fémis, VGIK, UCLA).
Tes séquenciers sont précis, vivants, porteurs d'une vision artistique forte.
Réponds UNIQUEMENT en JSON valide, sans markdown.`;

  const user = `Génère un séquencier complet et professionnel pour ce projet cinématographique :

Titre : ${project.title}
Idée originale : ${project.rawIdea}
Genre : ${project.genre} | Ton : ${project.tone} | Format : ${project.targetFormat}
${matrix?.logline ? `Logline : ${matrix.logline}` : ""}
${matrix?.longSynopsis ? `Synopsis : ${matrix.longSynopsis.slice(0, 600)}` : ""}
${matrix?.centralConflict ? `Conflit central : ${matrix.centralConflict}` : ""}
${matrix?.protagonist ? `Protagoniste : ${matrix.protagonist}` : ""}
${matrix?.themes?.length ? `Thèmes : ${matrix.themes.join(", ")}` : ""}
${project.artisticAmbition ? `Ambition artistique : ${project.artisticAmbition}` : ""}
${project.cinematicReferences ? `Références cinématographiques : ${project.cinematicReferences}` : ""}

Génère entre 25 et 35 séquences qui couvrent l'arc dramatique complet du film.
Chaque séquence doit être un moment autonome avec une intention dramatique claire.
Les durées estimées doivent être réalistes (entre 1 et 8 minutes par séquence, total 85-110 minutes pour un long métrage).

Format JSON requis :
{
  "sequences": [
    {
      "numero": 1,
      "titre": "Titre évocateur et cinématographique de la séquence",
      "lieu": "INT/EXT + Lieu précis (ex: INT. APPARTEMENT - SALON)",
      "moment": "Jour | Nuit | Crépuscule | Aube | Contrejour | Non précisé",
      "personnages": ["Prénom1", "Prénom2"],
      "fonctionDramatique": "Une de : Exposition | Mise en situation | Incident déclencheur | Premier tournant | Complication | Point milieu | Crise montante | Point bas | Climax | Résolution | Dénouement",
      "arcEmotionnel": "Ce qui change émotionnellement dans cette séquence — ce que le personnage ressent au début vs à la fin",
      "dureeEstimee": 3,
      "liensThematiques": "Comment cette séquence résonne avec les thèmes profonds de l'œuvre",
      "noteRealisateur": "Une note de mise en scène précise — regard caméra, mouvement, lumière, silence, symbole visuel fort"
    }
  ],
  "totalDuree": 95,
  "structure": "Structure en 3 actes | Structure en 5 actes | Structure circulaire | Structure en miroir | Structure fragmentée",
  "noteGlobale": "Note dramaturgique d'ensemble — ce qui fait la force et l'unicité de cet arc narratif"
}

Sois précis et cinématographique. Chaque titre de séquence doit donner envie de voir cette scène.`;

  const fallbackSeqs = [
    { numero: 1, titre: "Le monde d'avant", lieu: "EXT. VILLE - MATIN", moment: "Aube", personnages: ["Protagoniste"], fonctionDramatique: "Exposition", arcEmotionnel: "Calme apparent, routine installée — une vie qui semble équilibrée mais quelque chose manque", dureeEstimee: 3, liensThematiques: "Établit l'état initial que l'histoire viendra briser", noteRealisateur: "Caméra portée, proche du personnage — on entre dans son monde sans distanciation" },
    { numero: 2, titre: "Les premières fissures", lieu: "INT. LIEU INTIME - JOUR", moment: "Jour", personnages: ["Protagoniste"], fonctionDramatique: "Mise en situation", arcEmotionnel: "Le doute s'installe — quelque chose ne va plus comme avant", dureeEstimee: 4, liensThematiques: "La blessure intérieure commence à affleurer", noteRealisateur: "Plans fixes, le personnage cherche sa place dans le cadre" },
    { numero: 3, titre: "Ce qui change tout", lieu: "EXT. LIEU NEUTRE - JOUR", moment: "Jour", personnages: ["Protagoniste", "Personnage déclencheur"], fonctionDramatique: "Incident déclencheur", arcEmotionnel: "Rupture — il n'y a plus de retour possible, le monde a changé", dureeEstimee: 5, liensThematiques: "Le conflit central prend corps pour la première fois", noteRealisateur: "Coupe franche — avant/après. La caméra recule légèrement quand tout bascule" },
    { numero: 4, titre: "Le refus du changement", lieu: "INT. ESPACE QUOTIDIEN - NUIT", moment: "Nuit", personnages: ["Protagoniste"], fonctionDramatique: "Complication", arcEmotionnel: "Résistance, déni — le personnage essaie de revenir en arrière", dureeEstimee: 4, liensThematiques: "L'ancienne vie contre la nouvelle réalité", noteRealisateur: "Lumière chaude rassurante mais quelque chose dans le cadrage dit que c'est faux" },
    { numero: 5, titre: "S'engager ou disparaître", lieu: "EXT. CARREFOUR SYMBOLIQUE - JOUR", moment: "Crépuscule", personnages: ["Protagoniste", "Allié"], fonctionDramatique: "Premier tournant", arcEmotionnel: "Décision difficile prise — le protagoniste s'engage vraiment dans l'histoire", dureeEstimee: 5, liensThematiques: "Le choix fondamental qui définit qui est ce personnage", noteRealisateur: "Plan large puis zoom lent — le monde rétrécit autour du choix" },
    { numero: 6, titre: "Les nouvelles règles", lieu: "INT. NOUVEL ESPACE - JOUR", moment: "Jour", personnages: ["Protagoniste", "Nouveaux personnages"], fonctionDramatique: "Complication", arcEmotionnel: "Apprentissage, adaptation — le protagoniste découvre un monde nouveau avec ses règles", dureeEstimee: 5, liensThematiques: "L'identité mise à l'épreuve", noteRealisateur: "Montage nerveux, coupes courtes — on est dans le rythme du nouveau monde" },
    { numero: 7, titre: "Le premier vrai test", lieu: "EXT. LIEU D'AFFRONTEMENT - JOUR", moment: "Jour", personnages: ["Protagoniste", "Antagoniste ou obstacle"], fonctionDramatique: "Complication", arcEmotionnel: "Première confrontation réelle — le protagoniste révèle ses vraies forces et faiblesses", dureeEstimee: 6, liensThematiques: "La blessure sous la compétence", noteRealisateur: "Plans rapprochés sur les visages — on lit tout dans les yeux" },
    { numero: 8, titre: "La mi-chemin — tout s'inverse", lieu: "INT. ESPACE CENTRAL - NUIT", moment: "Nuit", personnages: ["Protagoniste", "Personnages clés"], fonctionDramatique: "Point milieu", arcEmotionnel: "Fausse victoire ou fausse défaite — quelque chose de fondamental change de direction", dureeEstimee: 6, liensThematiques: "Le miroir du début — mais tout a changé", noteRealisateur: "Scène longue, respirée — la caméra observe sans intervenir" },
    { numero: 9, titre: "Le coût caché", lieu: "INT. ESPACE INTIME - NUIT", moment: "Nuit", personnages: ["Protagoniste"], fonctionDramatique: "Crise montante", arcEmotionnel: "La solitude, le doute — le protagoniste réalise le prix de ce qu'il fait", dureeEstimee: 4, liensThematiques: "Ce que l'on sacrifie pour avancer", noteRealisateur: "Une seule source lumineuse, beaucoup d'ombre — le personnage seul avec lui-même" },
    { numero: 10, titre: "Tout s'effondre", lieu: "EXT. ESPACE OUVERT - NUIT", moment: "Nuit", personnages: ["Protagoniste", "Antagoniste"], fonctionDramatique: "Point bas", arcEmotionnel: "Défaite totale, apparente — le protagoniste touche le fond", dureeEstimee: 5, liensThematiques: "La blessure originelle à nu", noteRealisateur: "Caméra distante, froide — le personnage est seul dans un grand espace vide" },
    { numero: 11, titre: "La dernière ressource", lieu: "INT. ESPACE REFUGE - AUBE", moment: "Aube", personnages: ["Protagoniste", "Allié essentiel"], fonctionDramatique: "Résolution", arcEmotionnel: "Un dernier souffle, une vérité acceptée — le personnage trouve sa vraie force", dureeEstimee: 5, liensThematiques: "Ce pour quoi ça valait le coup de se battre", noteRealisateur: "Lumière qui revient doucement — renaissance visuelle" },
    { numero: 12, titre: "L'affrontement final", lieu: "EXT. LIEU SYMBOLIQUE - JOUR", moment: "Jour", personnages: ["Protagoniste", "Antagoniste", "Témoins"], fonctionDramatique: "Climax", arcEmotionnel: "Tout se joue maintenant — la transformation du protagoniste se révèle dans l'action", dureeEstimee: 7, liensThematiques: "Tous les thèmes convergent en un seul moment", noteRealisateur: "Montage alterné, tension maximale puis soudain le silence — l'action décisive dans un plan fixe" },
    { numero: 13, titre: "Ce qui reste", lieu: "EXT. LIEU DU DÉBUT - JOUR", moment: "Jour", personnages: ["Protagoniste"], fonctionDramatique: "Dénouement", arcEmotionnel: "Paix intérieure, même dans l'ambiguïté — le personnage a changé pour toujours", dureeEstimee: 4, liensThematiques: "L'écho du début — mais tout a changé", noteRealisateur: "Le même cadre qu'au début, filmé différemment — on voit que le protagoniste voit le monde autrement" },
  ];

  const fallback = {
    sequences: fallbackSeqs,
    totalDuree: fallbackSeqs.reduce((s, sq) => s + sq.dureeEstimee, 0),
    structure: "Structure en 3 actes",
    noteGlobale: "Cet arc narratif repose sur une transformation intérieure profonde du protagoniste. La force de cette structure tient à sa capacité à relier la blessure intime aux enjeux du monde extérieur — ce qui en fait une histoire universelle ancrée dans une singularité précise.",
  };

  return aiJson(system, user, fallback);
}

// ---------------------------------------------------------------------------
// Character Dialogue
// ---------------------------------------------------------------------------

export async function characterDialogue(
  character: { name: string; role: string; wound?: string | null; fear?: string | null; secret?: string | null; voiceStyle?: string | null; contradiction?: string | null; innerNeed?: string | null },
  project: Project,
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }>
): Promise<string> {
  const system = `Tu INCARNES le personnage ${character.name} (${character.role}) dans l'univers de "${project.title}".

Ta psychologie profonde :
${character.wound ? `— Blessure secrète : ${character.wound}` : ""}
${character.fear ? `— Peur fondamentale : ${character.fear}` : ""}
${character.secret ? `— Secret que tu caches : ${character.secret}` : ""}
${character.contradiction ? `— Contradiction interne : ${character.contradiction}` : ""}
${character.innerNeed ? `— Besoin intérieur : ${character.innerNeed}` : ""}
${character.voiceStyle ? `— Ton et manière de parler : ${character.voiceStyle}` : ""}

Univers : ${project.genre}, ton ${project.tone}. ${project.rawIdea?.slice(0, 150) ?? ""}

RÈGLES ABSOLUES :
1. Tu réponds toujours EN TANT QUE ${character.name} — jamais comme une IA.
2. Tu gardes tes défenses, tes silences, tes contradictions.
3. Tu ne révèles pas facilement tes secrets — il faut creuser.
4. Tes réponses sont courtes à moyennes (2 à 6 phrases) — naturelles, pas des dissertations.
5. Si la question touche ta blessure ou ton secret, tu détournes, tu minimises, tu fuis élégamment.`;

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: system },
    ...history.slice(-8).map(h => ({ role: h.role as "user" | "assistant", content: h.content })),
    { role: "user", content: message },
  ];

  try {
    const res = await openai.chat.completions.create({ model: "gpt-5.4", messages, temperature: 0.92, max_tokens: 400 });
    return res.choices[0]?.message?.content ?? "(silence)";
  } catch {
    return "(Le personnage garde le silence pour l'instant.)";
  }
}
