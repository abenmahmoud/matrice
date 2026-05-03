import { pgTable, text, real, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const projectsTable = pgTable("projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  rawIdea: text("raw_idea").notNull(),
  inputType: text("input_type"),
  genre: text("genre").notNull(),
  tone: text("tone").notNull(),
  targetFormat: text("target_format").notNull(),
  temporalLogic: text("temporal_logic"),
  realityLevel: text("reality_level"),
  targetAudience: text("target_audience"),
  artisticAmbition: text("artistic_ambition"),
  visualMoods: jsonb("visual_moods").$type<string[]>().notNull().default([]),
  cinematicReferences: text("cinematic_references").notNull().default(""),
  inspirationSources: text("inspiration_sources").notNull().default(""),
  manuscriptExcerpt: text("manuscript_excerpt").notNull().default(""),
  progression: real("progression").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;

export const narrativeMatricesTable = pgTable("narrative_matrices", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  centralConcept: text("central_concept").notNull().default(""),
  logline: text("logline").notNull().default(""),
  shortPitch: text("short_pitch").notNull().default(""),
  longSynopsis: text("long_synopsis").notNull().default(""),
  genre: text("genre").notNull().default(""),
  tone: text("tone").notNull().default(""),
  themes: jsonb("themes").$type<string[]>().notNull().default([]),
  universeLaws: jsonb("universe_laws").$type<string[]>().notNull().default([]),
  temporalRules: text("temporal_rules").notNull().default(""),
  spatialRules: text("spatial_rules").notNull().default(""),
  visibleWorld: text("visible_world").notNull().default(""),
  invisibleForces: text("invisible_forces").notNull().default(""),
  centralConflict: text("central_conflict").notNull().default(""),
  protagonist: text("protagonist").notNull().default(""),
  antagonist: text("antagonist").notNull().default(""),
  emotionalStakes: text("emotional_stakes").notNull().default(""),
  symbolicMotifs: jsonb("symbolic_motifs").$type<string[]>().notNull().default([]),
  powerObjects: jsonb("power_objects").$type<string[]>().notNull().default([]),
  secrets: jsonb("secrets").$type<string[]>().notNull().default([]),
  possibleEndings: jsonb("possible_endings").$type<string[]>().notNull().default([]),
  coherenceRules: jsonb("coherence_rules").$type<string[]>().notNull().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type NarrativeMatrix = typeof narrativeMatricesTable.$inferSelect;

export const emotionalCoresTable = pgTable("emotional_cores", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  dominantEmotion: text("dominant_emotion").notNull().default(""),
  hiddenWound: text("hidden_wound").notNull().default(""),
  emotionalLack: text("emotional_lack").notNull().default(""),
  innerChildSignal: text("inner_child_signal").notNull().default(""),
  protectionMask: text("protection_mask").notNull().default(""),
  apparentDesire: text("apparent_desire").notNull().default(""),
  deepNeed: text("deep_need").notNull().default(""),
  centralFear: text("central_fear").notNull().default(""),
  shamePoint: text("shame_point").notNull().default(""),
  guiltyPoint: text("guilty_point").notNull().default(""),
  symbolicObject: text("symbolic_object").notNull().default(""),
  symbolicPlace: text("symbolic_place").notNull().default(""),
  emotionalAntagonist: text("emotional_antagonist").notNull().default(""),
  emotionalContradiction: text("emotional_contradiction").notNull().default(""),
  correctionPath: text("correction_path").notNull().default(""),
  transformationArc: text("transformation_arc").notNull().default(""),
  finalEmotionalState: text("final_emotional_state").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type EmotionalCore = typeof emotionalCoresTable.$inferSelect;

export const emotionalPathsTable = pgTable("emotional_paths", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  stages: jsonb("stages").$type<Array<{ stage: string; label: string; description: string }>>().notNull().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type EmotionalPath = typeof emotionalPathsTable.$inferSelect;

export const charactersTable = pgTable("characters", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role").notNull(),
  nature: text("nature"),
  externalObjective: text("external_objective"),
  innerNeed: text("inner_need"),
  wound: text("wound"),
  fear: text("fear"),
  secret: text("secret"),
  contradiction: text("contradiction"),
  transformationArc: text("transformation_arc"),
  visualIdentity: text("visual_identity"),
  voiceStyle: text("voice_style"),
  linkToConflict: text("link_to_conflict"),
  backstory: text("backstory"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Character = typeof charactersTable.$inferSelect;

export const relationshipsTable = pgTable("relationships", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  characterAId: text("character_a_id"),
  characterBId: text("character_b_id"),
  characterAName: text("character_a_name").notNull(),
  characterBName: text("character_b_name").notNull(),
  relationshipType: text("relationship_type").notNull(),
  emotionalTension: text("emotional_tension"),
  hiddenTruth: text("hidden_truth"),
  conflict: text("conflict"),
  evolution: text("evolution"),
  symbolicMeaning: text("symbolic_meaning"),
});

export type Relationship = typeof relationshipsTable.$inferSelect;

export const worldDataTable = pgTable("world_data", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  locations: jsonb("locations").$type<Array<{ name: string; description: string; atmosphere?: string }>>().notNull().default([]),
  atmospheres: jsonb("atmospheres").$type<string[]>().notNull().default([]),
  temporalRules: text("temporal_rules").notNull().default(""),
  timelineEvents: jsonb("timeline_events").$type<Array<{ date: string; event: string; significance?: string }>>().notNull().default([]),
  parallelTimelines: jsonb("parallel_timelines").$type<string[]>().notNull().default([]),
  dreamLayers: jsonb("dream_layers").$type<string[]>().notNull().default([]),
  forbiddenRules: jsonb("forbidden_rules").$type<string[]>().notNull().default([]),
  causeEffectLogic: text("cause_effect_logic").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type WorldData = typeof worldDataTable.$inferSelect;

export const researchDataTable = pgTable("research_data", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  referenceWorks: jsonb("reference_works").$type<Array<{ title: string; author?: string; medium?: string; relevance: string }>>().notNull().default([]),
  criticalNotes: jsonb("critical_notes").$type<string[]>().notNull().default([]),
  successSignals: jsonb("success_signals").$type<string[]>().notNull().default([]),
  currentTrends: jsonb("current_trends").$type<string[]>().notNull().default([]),
  clicheRisks: jsonb("cliche_risks").$type<string[]>().notNull().default([]),
  originalityOpportunities: jsonb("originality_opportunities").$type<string[]>().notNull().default([]),
  creationNotes: text("creation_notes").notNull().default(""),
  abstractMechanics: jsonb("abstract_mechanics").$type<string[]>().notNull().default([]),
  humorPatterns: jsonb("humor_patterns").$type<string[]>().notNull().default([]),
  suspensePatterns: jsonb("suspense_patterns").$type<string[]>().notNull().default([]),
  tearTriggers: jsonb("tear_triggers").$type<string[]>().notNull().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ResearchData = typeof researchDataTable.$inferSelect;

export type ScoreCategory = {
  score: number;
  diagnostic: string;
  weaknesses: string[];
  corrections: string[];
  suggestions?: string[];
  trendNotes?: string;
  humorSources?: string[];
  tearTriggerMechanisms?: string[];
  suspenseMechanisms?: string[];
  attractivenessFactors?: string[];
  clicheRisk?: string;
  originalityOpportunity?: string;
};

export const hpsaScoresTable = pgTable("hpsa_scores", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  humour: jsonb("humour").$type<ScoreCategory>().notNull().default({ score: 0, diagnostic: "", weaknesses: [], corrections: [] }),
  pleur: jsonb("pleur").$type<ScoreCategory>().notNull().default({ score: 0, diagnostic: "", weaknesses: [], corrections: [] }),
  suspense: jsonb("suspense").$type<ScoreCategory>().notNull().default({ score: 0, diagnostic: "", weaknesses: [], corrections: [] }),
  attractivite: jsonb("attractivite").$type<ScoreCategory>().notNull().default({ score: 0, diagnostic: "", weaknesses: [], corrections: [] }),
  globalScore: real("global_score").notNull().default(0),
  priorityFixes: jsonb("priority_fixes").$type<string[]>().notNull().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type HpsaScore = typeof hpsaScoresTable.$inferSelect;

export type BookChapter = {
  number: number;
  title: string;
  summary: string;
  pov?: string;
  location?: string;
  timeframe?: string;
  emotionalArc?: string;
  keyScene?: string;
  closingHook?: string;
  narrativePurpose?: string;
  voiceNote?: string;
  draftContent?: string;
};

export const bookOutlinesTable = pgTable("book_outlines", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  titleIdeas: jsonb("title_ideas").$type<Array<string | { title: string; tone?: string; why?: string }>>().notNull().default([]),
  backCoverPitch: text("back_cover_pitch").notNull().default(""),
  shortSynopsis: text("short_synopsis").notNull().default(""),
  longSynopsis: text("long_synopsis").notNull().default(""),
  tableOfContents: jsonb("table_of_contents").$type<string[]>().notNull().default([]),
  structure: text("structure").notNull().default(""),
  narrativeVoice: text("narrative_voice").notNull().default(""),
  openingLine: text("opening_line").notNull().default(""),
  closingLine: text("closing_line").notNull().default(""),
  chapters: jsonb("chapters").$type<BookChapter[]>().notNull().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type BookOutline = typeof bookOutlinesTable.$inferSelect;

export type ScreenplayBeat = {
  number: number;
  label?: string;
  description: string;
  pageRange?: string;
};

export type ScreenplayScene = {
  number: number;
  heading: string;
  description: string;
  dialogueDraft?: string;
  emotionalTone?: string;
  dramaticFunction?: string;
};

export const screenplaysTable = pgTable("screenplays", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  logline: text("logline").notNull().default(""),
  tagline: text("tagline").notNull().default(""),
  cinematicSynopsis: text("cinematic_synopsis").notNull().default(""),
  treatment: text("treatment").notNull().default(""),
  beats: jsonb("beats").$type<ScreenplayBeat[]>().notNull().default([]),
  scenes: jsonb("scenes").$type<ScreenplayScene[]>().notNull().default([]),
  fountainScript: text("fountain_script").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Screenplay = typeof screenplaysTable.$inferSelect;

export type SeriesEpisode = {
  number: number;
  title: string;
  logline?: string;
  summary: string;
  openingScene?: string;
  questionDramatique?: string;
  intrigueA?: string;
  intrigueB?: string;
  midpoint?: string;
  climax?: string;
  cliffhanger?: string;
  emotionalEvolution?: string;
  humourOrganique?: string;
  momentDePleur?: string;
  keyReveal?: string;
  toneNote?: string;
  lienArcSaison?: string;
};

export const seriesTable = pgTable("series_data", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  format: text("format").notNull().default(""),
  loglineSerie: text("logline_serie").notNull().default(""),
  seasonConcept: text("season_concept").notNull().default(""),
  seriesPotential: text("series_potential").notNull().default(""),
  longArcs: jsonb("long_arcs").$type<Array<string | { label: string; description: string }>>().notNull().default([]),
  episodes: jsonb("episodes").$type<SeriesEpisode[]>().notNull().default([]),
  progressiveRevelations: jsonb("progressive_revelations").$type<Array<string | { episode: number; revelation: string }>>().notNull().default([]),
  secondaryCharacters: jsonb("secondary_characters").$type<Array<string | { name: string; role: string; arc: string }>>().notNull().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Series = typeof seriesTable.$inferSelect;

export const pitchDocumentsTable = pgTable("pitch_documents", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull().default(""),
  format: text("format").notNull().default(""),
  genre: text("genre").notNull().default(""),
  targetAudience: text("target_audience").notNull().default(""),
  comparableReferences: jsonb("comparable_references").$type<string[]>().notNull().default([]),
  visualDirection: text("visual_direction").notNull().default(""),
  authorNote: text("author_note").notNull().default(""),
  intentionNote: text("intention_note").notNull().default(""),
  whyNow: text("why_now").notNull().default(""),
  characters: text("characters").notNull().default(""),
  world: text("world").notNull().default(""),
  filmSeasonArc: text("film_season_arc").notNull().default(""),
  sellingPoints: jsonb("selling_points").$type<string[]>().notNull().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type PitchDocument = typeof pitchDocumentsTable.$inferSelect;

export const tensionArcsTable = pgTable("tension_arcs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  acts: jsonb("acts").$type<Array<{ label: string; description: string; tension: number; emotion: string; keyEvent: string }>>().notNull().default([]),
  overallShape: text("overall_shape").notNull().default(""),
  recommendation: text("recommendation").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export type TensionArc = typeof tensionArcsTable.$inferSelect;

export const atmosphereDataTable = pgTable("atmosphere_data", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  colorPalette: jsonb("color_palette").$type<Array<{ name: string; hex: string; role: string }>>().notNull().default([]),
  lightingStyle: text("lighting_style").notNull().default(""),
  musicReferences: jsonb("music_references").$type<Array<{ genre: string; artists: string[]; mood: string }>>().notNull().default([]),
  cinematicStyle: text("cinematic_style").notNull().default(""),
  textures: jsonb("textures").$type<string[]>().notNull().default([]),
  sensoryNotes: jsonb("sensory_notes").$type<{ smell: string; sound: string; touch: string }>().notNull().default({ smell: "", sound: "", touch: "" }),
  visualReferences: jsonb("visual_references").$type<string[]>().notNull().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export type AtmosphereData = typeof atmosphereDataTable.$inferSelect;

export const echoTempsTable = pgTable("echo_temps", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  mythicResonances: jsonb("mythic_resonances").$type<Array<{ myth: string; culture: string; connection: string }>>().notNull().default([]),
  historicalParallels: jsonb("historical_parallels").$type<Array<{ period: string; region: string; connection: string }>>().notNull().default([]),
  culturalEchoes: jsonb("cultural_echoes").$type<Array<{ culture: string; storyTitle: string; connection: string }>>().notNull().default([]),
  temporalAnchor: text("temporal_anchor").notNull().default(""),
  universalWound: text("universal_wound").notNull().default(""),
  futureResonance: text("future_resonance").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export type EchoTemps = typeof echoTempsTable.$inferSelect;

export const miroirArtistiqueTable = pgTable("miroir_artistique", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  trueTheme: text("true_theme").notNull().default(""),
  shadowStory: text("shadow_story").notNull().default(""),
  blindSpots: jsonb("blind_spots").$type<string[]>().notNull().default([]),
  resonanceGaps: jsonb("resonance_gaps").$type<Array<{ zone: string; reflection: string }>>().notNull().default([]),
  artisticInvitations: jsonb("artistic_invitations").$type<Array<{ invitation: string; why: string }>>().notNull().default([]),
  mirrorPhrase: text("mirror_phrase").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export type MiroirArtistique = typeof miroirArtistiqueTable.$inferSelect;

export const cinqPiliersTable = pgTable("cinq_piliers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  pillars: jsonb("pillars").$type<Array<{ name: string; presence: number; type: string; analysis: string; strongMoment: string; artisticSuggestion: string }>>().notNull().default([]),
  dominantPillar: text("dominant_pillar").notNull().default(""),
  weakestPillar: text("weakest_pillar").notNull().default(""),
  globalBalance: text("global_balance").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export type CinqPiliers = typeof cinqPiliersTable.$inferSelect;

export const sequencierTable = pgTable("sequencier", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  sequences: jsonb("sequences").$type<Array<{
    numero: number;
    titre: string;
    lieu: string;
    moment: string;
    personnages: string[];
    fonctionDramatique: string;
    arcEmotionnel: string;
    dureeEstimee: number;
    liensThematiques: string;
    noteRealisateur: string;
  }>>().notNull().default([]),
  totalDuree: real("total_duree").notNull().default(0),
  structure: text("structure").notNull().default(""),
  noteGlobale: text("note_globale").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export type Sequencier = typeof sequencierTable.$inferSelect;

export const noteIntentionTable = pgTable("note_intention", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  vision: text("vision").notNull().default(""),
  partiPrisMiseEnScene: text("parti_pris_mise_en_scene").notNull().default(""),
  personnagesVision: jsonb("personnages_vision").$type<Array<{ nom: string; visionRealisateur: string }>>().notNull().default([]),
  universVisuel: text("univers_visuel").notNull().default(""),
  musiqueEtSon: text("musique_et_son").notNull().default(""),
  positionnement: text("positionnement").notNull().default(""),
  pourquoiMaintenant: text("pourquoi_maintenant").notNull().default(""),
  motFinal: text("mot_final").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export type NoteIntention = typeof noteIntentionTable.$inferSelect;

// ---------------------------------------------------------------------------
// Film Data — concept et structure du long/court-métrage
// ---------------------------------------------------------------------------
export const filmDataTable = pgTable("film_data", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  concept: text("concept").notNull().default(""),
  logline: text("logline").notNull().default(""),
  tagline: text("tagline").notNull().default(""),
  shortSynopsis: text("short_synopsis").notNull().default(""),
  longSynopsis: text("long_synopsis").notNull().default(""),
  treatment: text("treatment").notNull().default(""),
  targetDuration: text("target_duration").notNull().default(""),
  filmFormat: text("film_format").notNull().default(""),
  visualPromise: text("visual_promise").notNull().default(""),
  emotionalPromise: text("emotional_promise").notNull().default(""),
  dramaticQuestion: text("dramatic_question").notNull().default(""),
  centralImage: text("central_image").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export type FilmData = typeof filmDataTable.$inferSelect;

// ---------------------------------------------------------------------------
// Film Scenes — scènes jouables avec analyse dramaturgique
// ---------------------------------------------------------------------------
export const filmScenesTable = pgTable("film_scenes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  sceneNumber: integer("scene_number").notNull().default(1),
  title: text("title").notNull().default(""),
  intExt: text("int_ext").notNull().default("INT."),
  location: text("location").notNull().default(""),
  timeOfDay: text("time_of_day").notNull().default(""),
  charactersPresent: jsonb("characters_present").$type<string[]>().notNull().default([]),
  protagonistObjective: text("protagonist_objective").notNull().default(""),
  obstacle: text("obstacle").notNull().default(""),
  visibleConflict: text("visible_conflict").notNull().default(""),
  emotionalSubtext: text("emotional_subtext").notNull().default(""),
  openingBeat: text("opening_beat").notNull().default(""),
  dramaticTurn: text("dramatic_turn").notNull().default(""),
  closingBeat: text("closing_beat").notNull().default(""),
  emotionBefore: text("emotion_before").notNull().default(""),
  emotionAfter: text("emotion_after").notNull().default(""),
  strongImage: text("strong_image").notNull().default(""),
  soundOrSilence: text("sound_or_silence").notNull().default(""),
  symbolicObject: text("symbolic_object").notNull().default(""),
  actionDescription: text("action_description").notNull().default(""),
  dialogueFragment: text("dialogue_fragment").notNull().default(""),
  narrativeFunction: text("narrative_function").notNull().default(""),
  suspenseLevel: real("suspense_level").notNull().default(0),
  humourLevel: real("humour_level").notNull().default(0),
  emotionalPowerLevel: real("emotional_power_level").notNull().default(0),
  attractivenessLevel: real("attractiveness_level").notNull().default(0),
  hpsaCheck: jsonb("hpsa_check").$type<Record<string, number>>().notNull().default({}),
  linkToEmotionalCore: text("link_to_emotional_core").notNull().default(""),
  directorNote: text("director_note").notNull().default(""),
  cameraSuggestion: text("camera_suggestion").notNull().default(""),
  riskOfCliche: text("risk_of_cliche").notNull().default(""),
  originalAlternative: text("original_alternative").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export type FilmScene = typeof filmScenesTable.$inferSelect;

// ---------------------------------------------------------------------------
// Content Versions — historique de versions pour chapitres, scénario, etc.
// ---------------------------------------------------------------------------

export const contentVersionsTable = pgTable("content_versions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  contentType: text("content_type").notNull(), // 'chapter' | 'screenplay' | 'pitch' | 'matrix' | 'note-intention'
  contentKey: text("content_key").notNull().default("full"), // chapter index as string or 'full'
  label: text("label").notNull(),
  data: jsonb("data").notNull(),
  wordCount: integer("word_count"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ContentVersion = typeof contentVersionsTable.$inferSelect;

// ---------------------------------------------------------------------------
// SRU Scores — Score de Résonance Universelle (Prisme des Quatre Publics)
// ---------------------------------------------------------------------------

export type TraditionMatch = {
  name: string;
  match: number;
  justification: string;
};

export const sruScoresTable = pgTable("sru_scores", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  etincelle: real("etincelle").notNull().default(0),
  etincelleComment: text("etincelle_comment").notNull().default(""),
  vibration: real("vibration").notNull().default(0),
  vibrationComment: text("vibration_comment").notNull().default(""),
  profondeur: real("profondeur").notNull().default(0),
  profondeurComment: text("profondeur_comment").notNull().default(""),
  maitrise: real("maitrise").notNull().default(0),
  maitriseComment: text("maitrise_comment").notNull().default(""),
  sru: real("sru").notNull().default(0),
  traditions: jsonb("traditions").$type<TraditionMatch[]>().notNull().default([]),
  syntheseGlobale: text("synthese_globale").notNull().default(""),
  niveauResonance: text("niveau_resonance").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type SruScore = typeof sruScoresTable.$inferSelect;
