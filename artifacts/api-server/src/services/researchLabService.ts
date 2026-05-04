import { openai } from "@workspace/integrations-openai-ai-server";

// ---------------------------------------------------------------------------
// Taxonomies
// ---------------------------------------------------------------------------

export const ERAS = [
  { key: "antiquity", label: "Antiquité", start: -3000, end: 500, desc: "Épopées, mythes fondateurs, tragédies grecques, Bible, Mahabharata" },
  { key: "medieval", label: "Moyen Âge", start: 500, end: 1500, desc: "Chansons de geste, 1001 Nuits, mystères, fables morales" },
  { key: "renaissance", label: "Renaissance & Baroque", start: 1500, end: 1800, desc: "Théâtre élisabéthain, roman picaresque, commedia dell'arte" },
  { key: "industrial", label: "Ère industrielle", start: 1800, end: 1895, desc: "Roman réaliste, naturalisme, feuilleton, Dickens, Flaubert, Dostoïevski" },
  { key: "silent_cinema", label: "Cinéma muet", start: 1895, end: 1930, desc: "Naissance du montage, grammaire visuelle, Eisenstein, Griffith, Méliès" },
  { key: "golden_age", label: "Âge d'or", start: 1930, end: 1960, desc: "Hollywood classique, codes du genre, studio system, néoréalisme" },
  { key: "new_waves", label: "Nouvelles Vagues", start: 1960, end: 1980, desc: "Rupture moderniste, auteurisme mondial, Godard, Kurosawa, Satyajit Ray" },
  { key: "postmodern", label: "Postmoderne", start: 1980, end: 2000, desc: "Déconstruction, métafiction, Tarantino, Lynch, García Márquez" },
  { key: "digital", label: "Ère numérique", start: 2000, end: 2015, desc: "Séries complexes, transmedia, storytelling interactif, HBO, K-drama" },
  { key: "contemporary", label: "Contemporain", start: 2015, end: 2024, desc: "Streaming global, algorithmes, voix émergentes, diversité narrative" },
];

export const CULTURES = [
  { key: "western", label: "Occidentale", icon: "⚔️", desc: "Europe — philosophie grecque, christianisme, Lumières, modernisme" },
  { key: "arabic", label: "Arabe & Moyen-Orient", icon: "🌙", desc: "1001 Nuits, Al-Andalus, cinéma égyptien, Naguib Mahfouz" },
  { key: "indian", label: "Indienne & Bollywood", icon: "🪔", desc: "Mahabharata, Ramayana, Satyajit Ray, Bollywood, traditions dravidienne" },
  { key: "american", label: "Américaine", icon: "🎬", desc: "Hollywood, cinéma noir, Harlem Renaissance, indépendant US" },
  { key: "japanese", label: "Japonaise", icon: "⛩️", desc: "Manga, anime, Kurosawa, wabi-sabi, Ozu, monogatari" },
  { key: "african", label: "Africaine", icon: "🥁", desc: "Griots, Nollywood, Sembène Ousmane, Ubuntu, tradition orale yoruba" },
  { key: "latin", label: "Latino-américaine", icon: "🌺", desc: "Réalisme magique, telenovela, Buñuel, Iñárritu, Borges" },
  { key: "east_asian", label: "Asie de l'Est", icon: "🎎", desc: "Cinéma coréen, Hong Kong, Zhang Yimou, Park Chan-wook, wuxia" },
];

export const MEDIUMS = [
  { key: "oral", label: "Tradition orale" },
  { key: "theater", label: "Théâtre" },
  { key: "literature", label: "Littérature" },
  { key: "silent_film", label: "Cinéma muet" },
  { key: "cinema", label: "Cinéma parlant" },
  { key: "television", label: "Télévision & Série" },
  { key: "comics", label: "BD & Manga" },
  { key: "streaming", label: "Streaming & Digital" },
];

export const RESEARCH_TYPES = [
  { key: "standard", label: "Exploration standard", icon: "🔭", desc: "Analyse d'une tradition narrative par ère, culture et médium" },
  { key: "synthesis", label: "Synthèse croisée", icon: "⚡", desc: "Comparaison de 2 cultures sur un thème universel — génère des techniques hybrides inédites" },
  { key: "emotional_atlas", label: "Atlas émotionnel", icon: "💡", desc: "Structures narratives qui produisent une émotion cible, validées cross-culturellement" },
  { key: "conflict_grammar", label: "Grammaire des conflits", icon: "⚖️", desc: "Théorie profonde du conflit propre à une culture et ses applications contemporaines" },
  { key: "archetype_deep", label: "Archétype en profondeur", icon: "🎭", desc: "Un archétype comparé dans plusieurs cultures — enrichit la création de personnages" },
  { key: "evolution_spiral", label: "Spirale d'évolution", icon: "🌀", desc: "Comment une technique narrative a évolué dans le temps au sein d'une culture" },
  { key: "problem_solution", label: "Problème → Solution", icon: "🎯", desc: "Solutions narratives éprouvées à un problème structurel spécifique" },
];

export const UNIVERSAL_THEMES = [
  "La mort du héros", "Le sacrifice", "La rédemption", "L'exil et le retour",
  "Le père et le fils", "La trahison", "L'amour impossible", "La quête identitaire",
  "La vengeance", "La transformation intérieure", "Le pouvoir corrupteur", "La survie",
];

export const NARRATIVE_EMOTIONS = [
  "Catharsis (libération par la tragédie)", "Honte rédemptrice", "Espoir déchirant",
  "Terreur sacrée", "Mélancolie douce", "Fureur morale", "Émerveillement cosmique",
  "Solitude universelle", "Joie amère", "Désir insatisfait",
];

export const UNIVERSAL_ARCHETYPES = [
  "Le Trickster", "L'Orphelin", "Le Sage", "Le Guerrier", "La Mère protectrice",
  "L'Ennemi intérieur", "Le Gardien du seuil", "Le Métamorphe", "L'Innocent",
  "Le Héraut", "Le Rebelle", "Le Créateur",
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ExtractedSkill = {
  name: string; category: string; description: string; promptContent: string;
};

export type ResearchEntryData = {
  title: string; summary: string;
  keyTechniques: string[]; emotionalPrinciples: string[];
  culturalContext: string; notableWorks: string[];
  narrativeLessons: string; themes: string[]; universalScore: number;
  extractedSkills: ExtractedSkill[];
};

// ---------------------------------------------------------------------------
// AI helper
// ---------------------------------------------------------------------------

async function aiJson<T>(system: string, user: string, fallback: T): Promise<T> {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL ?? "gpt-4o",
      max_completion_tokens: 8192,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
    });
    const content = response.choices[0]?.message?.content;
    if (!content) return fallback;
    return JSON.parse(content) as T;
  } catch { return fallback; }
}

const SYSTEM_NARRATOLOGIST = `Tu es un chercheur en narratologie comparée, histoire du cinéma et littérature mondiale. Tu maîtrises toutes les cultures et époques. Tu travailles en français. Tu génères des analyses profondes et ACTIONNABLES pour les créateurs contemporains. Réponds UNIQUEMENT en JSON valide.`;

function jsonShape(extra?: string) {
  return `{
  "title": "titre précis et évocateur",
  "summary": "analyse dense de 3-4 paragraphes — contexte, enjeux, pertinence contemporaine",
  "keyTechniques": ["TECHNIQUE 1 — nom : description actionnable (comment l'appliquer maintenant)", "TECHNIQUE 2", "TECHNIQUE 3", "TECHNIQUE 4", "TECHNIQUE 5"],
  "emotionalPrinciples": ["PRINCIPE ÉMOTIONNEL 1 — mécanisme et application", "PRINCIPE 2", "PRINCIPE 3"],
  "culturalContext": "contexte profond (2 paragraphes) — valeurs, tensions, croyances qui définissent ce que 'bonne histoire' signifie ici",
  "notableWorks": ["oeuvre 1 + date + description courte", "oeuvre 2", "oeuvre 3", "oeuvre 4"],
  "narrativeLessons": "leçons pour l'auteur d'aujourd'hui (2-3 paragraphes concrets)",
  "themes": ["thème 1", "thème 2", "thème 3"],
  "universalScore": <entier 1-10 indiquant à quel point ces techniques sont universellement applicables>,
  ${extra ?? '"extractedSkills": [{"name":"...","category":"technique|structure|theme|character|world|style","description":"1 phrase","promptContent":"instruction précise 3-4 phrases pour l\'IA"}]'}
}`;
}

// ---------------------------------------------------------------------------
// 1. Standard exploration
// ---------------------------------------------------------------------------

export async function generateResearchEntry(eraKey: string, cultureKey: string, mediumKey: string): Promise<ResearchEntryData> {
  const era = ERAS.find(e => e.key === eraKey) ?? ERAS[0];
  const culture = CULTURES.find(c => c.key === cultureKey) ?? CULTURES[0];
  const medium = MEDIUMS.find(m => m.key === mediumKey)?.label ?? mediumKey;

  return aiJson<ResearchEntryData>(SYSTEM_NARRATOLOGIST, `Génère une entrée de recherche narrative approfondie :

ÈRE : ${era.label} (${era.start > 0 ? era.start : `${Math.abs(era.start)} av. J.-C.`} → ${era.end}) — ${era.desc}
CULTURE : ${culture.label} — ${culture.desc}
MÉDIUM : ${medium}

Génère un JSON avec exactement ces champs :
${jsonShape()}

Sois profond, spécifique, jamais générique. Les techniques doivent être uniques à cette tradition.`,
    emptyEntry());
}

// ---------------------------------------------------------------------------
// 2. Cross-cultural synthesis
// ---------------------------------------------------------------------------

export async function generateCrossCulturalSynthesis(theme: string, culture1Key: string, culture2Key: string): Promise<ResearchEntryData> {
  const c1 = CULTURES.find(c => c.key === culture1Key) ?? CULTURES[0];
  const c2 = CULTURES.find(c => c.key === culture2Key) ?? CULTURES[1];

  return aiJson<ResearchEntryData>(SYSTEM_NARRATOLOGIST, `Génère une SYNTHÈSE CROISÉE narrative entre deux traditions sur un thème universel.

THÈME UNIVERSEL : "${theme}"
CULTURE 1 : ${c1.label} — ${c1.desc}
CULTURE 2 : ${c2.label} — ${c2.desc}

Objectif : trouver ce que ni l'une ni l'autre tradition n'a articulé seule — les TECHNIQUES HYBRIDES qui émergent du croisement. C'est la zone où naît l'universel.

Structure attendue :
- Comment chaque culture traite ce thème (approches différentes)
- Points de convergence profonde (ce qui est universel)
- Divergences révélatrices (ce qui est culturellement spécifique)
- 5 techniques hybrides inédites qui combinent les deux approches

Génère un JSON :
${jsonShape()}`, emptyEntry());
}

// ---------------------------------------------------------------------------
// 3. Emotional atlas
// ---------------------------------------------------------------------------

export async function generateEmotionalAtlas(emotion: string): Promise<ResearchEntryData> {
  return aiJson<ResearchEntryData>(SYSTEM_NARRATOLOGIST, `Génère un ATLAS ÉMOTIONNEL pour l'émotion cible suivante :

ÉMOTION CIBLE : "${emotion}"

Objectif : cartographier précisément quelles structures narratives, dans quelles cultures et à quelles époques, produisent cette émotion de manière FIABLE et PROFONDE chez le spectateur/lecteur.

Structure attendue :
- Définition narrative de cette émotion (pas psychologique, mais dramaturgique)
- Quelles cultures maîtrisent le mieux cette émotion et pourquoi
- Structures dramaturgiques qui déclenchent cette émotion (avec exemples précis)
- Erreurs classiques qui tuent cette émotion
- Recette actionnable pour l'auteur d'aujourd'hui

Les keyTechniques doivent être des structures PRÉCISES (pas "crée de l'empathie" mais "place ton protagoniste dans une situation d'humiliation publique suivie d'un acte de dignité silencieuse — durée max 3 scènes").

Génère un JSON :
${jsonShape()}`, emptyEntry());
}

// ---------------------------------------------------------------------------
// 4. Conflict grammar
// ---------------------------------------------------------------------------

export async function generateConflictGrammar(cultureKey: string): Promise<ResearchEntryData> {
  const culture = CULTURES.find(c => c.key === cultureKey) ?? CULTURES[0];

  return aiJson<ResearchEntryData>(SYSTEM_NARRATOLOGIST, `Génère une GRAMMAIRE DES CONFLITS pour la culture suivante :

CULTURE : ${culture.label} — ${culture.desc}

Objectif : décoder la théorie profonde du conflit propre à cette culture — sa logique interne, ses archétypes, ses résolutions attendues et inattendues.

Structure attendue :
- Philosophie du conflit de cette culture (qu'est-ce qui mérite un conflit ? qu'est-ce qui ne le mérite pas ?)
- Les 3-5 types de conflits fondamentaux de cette culture (avec noms culturellement précis si possible)
- Comment cette culture résout les conflits (catharsis, réconciliation, sacrifice, transformation ?)
- Ce que les auteurs contemporains peuvent emprunter à cette grammaire
- Exemples précis dans les œuvres les plus connues

Les keyTechniques doivent être des OUTILS DE CONFLIT actionnables.

Génère un JSON :
${jsonShape()}`, emptyEntry());
}

// ---------------------------------------------------------------------------
// 5. Archetype deep dive
// ---------------------------------------------------------------------------

export async function generateArchetypeDeepDive(archetype: string, cultureKeys: string[]): Promise<ResearchEntryData> {
  const cultures = cultureKeys.map(k => CULTURES.find(c => c.key === k)).filter(Boolean);
  const culturesStr = cultures.map(c => `${c!.label} (${c!.desc})`).join("\n");

  return aiJson<ResearchEntryData>(SYSTEM_NARRATOLOGIST, `Génère une ANALYSE PROFONDE D'ARCHÉTYPE narrative.

ARCHÉTYPE : "${archetype}"
CULTURES À COMPARER :
${culturesStr}

Objectif : montrer comment le même archétype existe différemment selon les cultures — ses variations, ses fonctions symboliques uniques, et comment les combiner pour créer un personnage d'une profondeur inédite.

Structure attendue :
- Définition universelle de l'archétype (Jungien + narratologique)
- Comment chaque culture l'incarne différemment (avec exemples précis)
- Ce qui est universel dans cet archétype (ce qui touche tout humain)
- Ce qui est culturellement spécifique (ce qui enrichit par contraste)
- Comment créer une version contemporaine hybride et universelle

Génère un JSON :
${jsonShape()}`, emptyEntry());
}

// ---------------------------------------------------------------------------
// 6. Evolution spiral
// ---------------------------------------------------------------------------

export async function generateEvolutionSpiral(technique: string, cultureKey: string): Promise<ResearchEntryData> {
  const culture = CULTURES.find(c => c.key === cultureKey) ?? CULTURES[0];

  return aiJson<ResearchEntryData>(SYSTEM_NARRATOLOGIST, `Génère une SPIRALE D'ÉVOLUTION narrative.

TECHNIQUE NARRATIVE : "${technique}"
CULTURE : ${culture.label} — ${culture.desc}

Objectif : tracer l'évolution chronologique de cette technique dans cette tradition culturelle, de ses origines jusqu'à l'état contemporain. Comprendre l'évolution permet de la transcender.

Structure attendue :
- Origine et contexte de naissance de cette technique dans cette culture
- Les grandes mutations (tournants historiques, innovations clés avec dates)
- État actuel et vers où elle semble se diriger
- Ce que l'auteur contemporain peut faire que personne n'a encore fait
- Chronologie des œuvres fondatrices de chaque phase

Génère un JSON :
${jsonShape()}`, emptyEntry());
}

// ---------------------------------------------------------------------------
// 7. Problem → Solution
// ---------------------------------------------------------------------------

export async function generateProblemSolution(problem: string, cultureKey: string): Promise<ResearchEntryData> {
  const culture = CULTURES.find(c => c.key === cultureKey) ?? CULTURES[0];

  return aiJson<ResearchEntryData>(SYSTEM_NARRATOLOGIST, `Génère une BASE PROBLÈME → SOLUTION narrative.

PROBLÈME NARRATIF : "${problem}"
CULTURE DE RÉFÉRENCE : ${culture.label} — ${culture.desc}

Objectif : documenter précisément comment cette tradition a résolu ce problème narratif récurrent, avec des solutions actionnables pour l'auteur d'aujourd'hui.

Structure attendue :
- Définition précise du problème (symptômes dans un récit, pourquoi ça coince)
- Comment cette culture a développé une solution unique
- La mécanique précise de la solution (pas juste "utilisez des métaphores")
- Exemples d'œuvres qui résolvent brillamment ce problème dans cette tradition
- Comment adapter cette solution à un contexte contemporain occidental/global

Les keyTechniques doivent être des solutions PRÉCISES et TESTÉES.

Génère un JSON :
${jsonShape()}`, emptyEntry());
}

// ---------------------------------------------------------------------------
// Auto-select target (gap analysis)
// ---------------------------------------------------------------------------

export function selectDailyTarget(existing: Array<{ era: string; culture: string; researchType?: string | null }>): {
  era: string; culture: string; medium: string; researchType: string; customInput?: string;
} {
  // Prioritize advanced research types if we have enough standard entries
  const standardCount = existing.filter(e => !e.researchType || e.researchType === "standard").length;

  if (standardCount >= 5) {
    // Rotate through advanced types
    const advancedTypes = ["synthesis", "emotional_atlas", "conflict_grammar", "archetype_deep", "evolution_spiral", "problem_solution"];
    const existingAdvanced = existing.filter(e => e.researchType && e.researchType !== "standard");
    const usedTypes = new Set(existingAdvanced.map(e => e.researchType));
    const nextType = advancedTypes.find(t => !usedTypes.has(t)) ?? advancedTypes[Math.floor(Math.random() * advancedTypes.length)];

    const defaults: Record<string, { customInput?: string; culture?: string }> = {
      synthesis: { customInput: UNIVERSAL_THEMES[Math.floor(Math.random() * UNIVERSAL_THEMES.length)] },
      emotional_atlas: { customInput: NARRATIVE_EMOTIONS[Math.floor(Math.random() * NARRATIVE_EMOTIONS.length)] },
      conflict_grammar: { culture: CULTURES[Math.floor(Math.random() * CULTURES.length)].key },
      archetype_deep: { customInput: UNIVERSAL_ARCHETYPES[Math.floor(Math.random() * UNIVERSAL_ARCHETYPES.length)] },
      evolution_spiral: { customInput: "Le flash-back", culture: "american" },
      problem_solution: { customInput: "L'exposition lourde", culture: CULTURES[Math.floor(Math.random() * CULTURES.length)].key },
    };

    const d = defaults[nextType] ?? {};
    return {
      era: "contemporary", culture: d.culture ?? CULTURES[Math.floor(Math.random() * CULTURES.length)].key,
      medium: "cinema", researchType: nextType, customInput: d.customInput,
    };
  }

  // Standard gap-filling
  const covered = new Set(existing.filter(e => !e.researchType || e.researchType === "standard").map(e => `${e.era}__${e.culture}`));
  const candidates = ERAS.flatMap(era => CULTURES
    .filter(c => !covered.has(`${era.key}__${c.key}`))
    .map(c => ({ era: era.key, culture: c.key, priority: ["new_waves", "golden_age"].includes(era.key) ? 2 : 1 }))
  );

  if (!candidates.length) {
    const era = ERAS[Math.floor(Math.random() * ERAS.length)];
    const culture = CULTURES[Math.floor(Math.random() * CULTURES.length)];
    return { era: era.key, culture: culture.key, medium: "cinema", researchType: "standard" };
  }

  candidates.sort((a, b) => b.priority - a.priority);
  const chosen = candidates.slice(0, 10)[Math.floor(Math.random() * Math.min(10, candidates.length))];
  const media = ["cinema", "literature", "theater", "television", "oral"];
  return { ...chosen, medium: media[Math.floor(Math.random() * media.length)], researchType: "standard" };
}

// ---------------------------------------------------------------------------
// Empty fallback
// ---------------------------------------------------------------------------

function emptyEntry(): ResearchEntryData {
  return {
    title: "Entrée de recherche", summary: "À générer", keyTechniques: [], emotionalPrinciples: [],
    culturalContext: "", notableWorks: [], narrativeLessons: "", themes: [], universalScore: 5, extractedSkills: [],
  };
}
