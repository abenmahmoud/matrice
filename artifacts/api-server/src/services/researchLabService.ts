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
  { key: "arabic", label: "Arabe & Moyen-Orient", icon: "🌙", desc: "1001 Nuits, Al-Andalus, cinéma égyptien, Naguib Mahfouz, Omar Sharif" },
  { key: "indian", label: "Indienne & Bollywood", icon: "🪔", desc: "Mahabharata, Ramayana, Satyajit Ray, Bollywood, traditions dravidienne" },
  { key: "american", label: "Américaine", icon: "🎬", desc: "Hollywood, cinéma noir, Harlem Renaissance, indépendant US, hip-hop" },
  { key: "japanese", label: "Japonaise", icon: "⛩️", desc: "Manga, anime, Kurosawa, wabi-sabi, Ozu, monogatari, jidaigeki" },
  { key: "african", label: "Africaine", icon: "🥁", desc: "Griots, Nollywood, Sembène Ousmane, Ubuntu, tradition orale yoruba" },
  { key: "latin", label: "Latino-américaine", icon: "🌺", desc: "Réalisme magique, telenovela, Buñuel, Iñárritu, García Márquez, Borges" },
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ExtractedSkill = {
  name: string;
  category: string;
  description: string;
  promptContent: string;
};

export type ResearchEntryData = {
  title: string;
  summary: string;
  keyTechniques: string[];
  emotionalPrinciples: string[];
  culturalContext: string;
  notableWorks: string[];
  narrativeLessons: string;
  extractedSkills: ExtractedSkill[];
};

// ---------------------------------------------------------------------------
// Core AI helper
// ---------------------------------------------------------------------------

async function aiJson<T>(system: string, user: string, fallback: T): Promise<T> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    const content = response.choices[0]?.message?.content;
    if (!content) return fallback;
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Main generation function
// ---------------------------------------------------------------------------

export async function generateResearchEntry(
  eraKey: string,
  cultureKey: string,
  mediumKey: string
): Promise<ResearchEntryData> {
  const era = ERAS.find(e => e.key === eraKey) ?? ERAS[0];
  const culture = CULTURES.find(c => c.key === cultureKey) ?? CULTURES[0];
  const medium = MEDIUMS.find(m => m.key === mediumKey)?.label ?? mediumKey;

  const system = `Tu es un chercheur en narratologie comparée, histoire du cinéma et littérature mondiale. Tu maîtrises les traditions narratives de toutes les cultures et époques — de l'Antiquité au cinéma contemporain. Tu travailles en français. Tu génères des analyses profondes et ACTIONNABLES pour les créateurs contemporains. Chaque insight doit être utilisable concrètement dans l'écriture d'un roman, film, ou série d'aujourd'hui. Réponds UNIQUEMENT en JSON valide.`;

  const user = `Génère une entrée de recherche narrative approfondie sur cette tradition :

ÈRE : ${era.label} (${era.start > 0 ? era.start : `${Math.abs(era.start)} av. J.-C.`} → ${era.end}) — ${era.desc}
CULTURE : ${culture.label} — ${culture.desc}
MÉDIUM : ${medium}

Cette recherche doit être PROFONDE et ACTIONNABLE. Elle servira à enrichir une IA de création narrative pour qu'elle génère des histoires qui touchent émotionnellement une audience mondiale.

Génère un objet JSON avec exactement ces champs :
{
  "title": "titre précis et évocateur, ex: 'Le pacte avec l'invisible : structure émotionnelle du conte arabe médiéval'",
  "summary": "analyse dense de 3-4 paragraphes — contexte historique, enjeux narratifs, impact sur la création mondiale, pourquoi cette tradition EST ENCORE PERTINENTE aujourd'hui",
  "keyTechniques": [
    "TECHNIQUE 1 — nom de la technique : description actionnable (2 phrases) sur COMMENT l'appliquer dans un récit contemporain. Exemple : 'La tragédie par hamartia — définis UN angle mort moral précis chez ton protagoniste qui soit culturellement universel...'",
    "TECHNIQUE 2 — ...",
    "TECHNIQUE 3 — ...",
    "TECHNIQUE 4 — ...",
    "TECHNIQUE 5 — ..."
  ],
  "emotionalPrinciples": [
    "PRINCIPE ÉMOTIONNEL 1 — comment cette culture/époque gérait l'émotion dans le récit et ce qu'on peut en apprendre",
    "PRINCIPE 2 — ...",
    "PRINCIPE 3 — ..."
  ],
  "culturalContext": "contexte culturel profond (2 paragraphes) : quelles valeurs, tensions, croyances définissent ce que 'une bonne histoire' signifie dans cette culture à cette époque — et ce que cela révèle sur la nature humaine universelle",
  "notableWorks": ["oeuvre ou artiste 1 avec date et brève description", "oeuvre 2", "oeuvre 3", "oeuvre 4", "oeuvre 5"],
  "narrativeLessons": "leçons narratives pour l'auteur d'aujourd'hui (2-3 paragraphes) : ce qu'on peut concrètement emprunter à cette tradition pour toucher une audience du XXIe siècle, toutes cultures confondues",
  "extractedSkills": [
    {
      "name": "nom du skill narratif extrait de cette recherche",
      "category": "technique|structure|theme|character|world|style",
      "description": "description en 1 phrase percutante",
      "promptContent": "instruction précise et détaillée pour l'IA — comment appliquer ce skill dans une génération narrative : ton, contraintes, exemples, références (3-4 phrases concrètes)"
    },
    { ... 2e skill ... },
    { ... 3e skill ... }
  ]
}

Sois profond, spécifique, jamais générique. Les techniques doivent être uniques à cette tradition et non applicables à n'importe quel contexte.`;

  const fallback: ResearchEntryData = {
    title: `Recherche : ${culture.label} — ${era.label}`,
    summary: `Analyse de la tradition narrative ${culture.label} durant la période ${era.label}.`,
    keyTechniques: ["À générer via l'IA"],
    emotionalPrinciples: ["À analyser"],
    culturalContext: "Contexte à développer",
    notableWorks: ["Références à compléter"],
    narrativeLessons: "Leçons à extraire",
    extractedSkills: [],
  };

  return aiJson<ResearchEntryData>(system, user, fallback);
}

// ---------------------------------------------------------------------------
// Auto-select research target (gap analysis)
// ---------------------------------------------------------------------------

export function selectDailyTarget(existing: Array<{ era: string; culture: string }>): { era: string; culture: string; medium: string } {
  const covered = new Set(existing.map(e => `${e.era}__${e.culture}`));
  const candidates: Array<{ era: string; culture: string; medium: string; priority: number }> = [];

  for (const era of ERAS) {
    for (const culture of CULTURES) {
      const key = `${era.key}__${culture.key}`;
      if (!covered.has(key)) {
        const priority = (era.key === "new_waves" || era.key === "golden_age") ? 2 : 1;
        candidates.push({ era: era.key, culture: culture.key, medium: "cinema", priority });
      }
    }
  }

  if (!candidates.length) {
    const era = ERAS[Math.floor(Math.random() * ERAS.length)];
    const culture = CULTURES[Math.floor(Math.random() * CULTURES.length)];
    return { era: era.key, culture: culture.key, medium: "cinema" };
  }

  candidates.sort((a, b) => b.priority - a.priority);
  const top = candidates.slice(0, 10);
  const chosen = top[Math.floor(Math.random() * top.length)];

  const media = ["cinema", "literature", "theater", "television", "oral"];
  chosen.medium = media[Math.floor(Math.random() * media.length)];
  return chosen;
}

// ---------------------------------------------------------------------------
// Skill extraction from existing entry content
// ---------------------------------------------------------------------------

export async function deepExtractSkills(entryTitle: string, narrativeLessons: string, keyTechniques: string[]): Promise<ExtractedSkill[]> {
  const system = `Tu es un expert en extraction de skills narratifs actionnables. Tu travailles en français. Réponds UNIQUEMENT en JSON valide.`;
  const user = `À partir de cette entrée de recherche narrative, extrait 2-4 nouveaux skills IA hautement actionnables.

TITRE : ${entryTitle}
TECHNIQUES CLÉS : ${keyTechniques.slice(0, 3).join(" | ")}
LEÇONS : ${narrativeLessons.slice(0, 500)}

Génère un objet JSON :
{
  "skills": [
    {
      "name": "nom du skill",
      "category": "technique|structure|theme|character|world|style",
      "description": "description en 1 phrase",
      "promptContent": "instruction détaillée pour l'IA (3-4 phrases concrètes)"
    }
  ]
}`;

  type SkillsResult = { skills: ExtractedSkill[] };
  const result = await aiJson<SkillsResult>(system, user, { skills: [] });
  return result.skills;
}
