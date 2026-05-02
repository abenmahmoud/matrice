import { pgTable, text, integer, timestamp, json } from "drizzle-orm/pg-core";

export const manuscriptAnalysesTable = pgTable("manuscript_analyses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  projectId: text("project_id"),
  contentExcerpt: text("content_excerpt").notNull().default(""),
  wordCount: integer("word_count").notNull().default(0),
  // Scores 0–100
  globalScore: integer("global_score").notNull().default(0),
  structureScore: integer("structure_score").notNull().default(0),
  emotionScore: integer("emotion_score").notNull().default(0),
  archetypeScore: integer("archetype_score").notNull().default(0),
  originalityScore: integer("originality_score").notNull().default(0),
  coherenceScore: integer("coherence_score").notNull().default(0),
  // Arrays
  strengths: json("strengths").$type<string[]>().notNull().default([]),
  weaknesses: json("weaknesses").$type<string[]>().notNull().default([]),
  detectedArchetypes: json("detected_archetypes").$type<string[]>().notNull().default([]),
  detectedEmotions: json("detected_emotions").$type<string[]>().notNull().default([]),
  appliedTechniques: json("applied_techniques").$type<string[]>().notNull().default([]),
  missingTechniques: json("missing_techniques").$type<string[]>().notNull().default([]),
  coherenceValidations: json("coherence_validations").$type<string[]>().notNull().default([]),
  coherenceIssues: json("coherence_issues").$type<string[]>().notNull().default([]),
  comparableWorks: json("comparable_works").$type<Array<{ title: string; author: string; relevance: string }>>().notNull().default([]),
  // Long text
  structureAnalysis: text("structure_analysis").notNull().default(""),
  emotionAnalysis: text("emotion_analysis").notNull().default(""),
  recommendations: text("recommendations").notNull().default(""),
  coherenceAnalysis: text("coherence_analysis").notNull().default(""),
  verdict: text("verdict").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ManuscriptAnalysis = typeof manuscriptAnalysesTable.$inferSelect;
