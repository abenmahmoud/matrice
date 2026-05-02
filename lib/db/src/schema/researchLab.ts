import { pgTable, text, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";

export const researchEntriesTable = pgTable("research_entries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  researchType: text("research_type").notNull().default("standard"),
  era: text("era").notNull().default(""),
  eraLabel: text("era_label").notNull().default(""),
  eraStart: integer("era_start"),
  eraEnd: integer("era_end"),
  culture: text("culture").notNull().default(""),
  cultureLabel: text("culture_label").notNull().default(""),
  culture2: text("culture2").notNull().default(""),
  culture2Label: text("culture2_label").notNull().default(""),
  medium: text("medium").notNull().default(""),
  customInput: text("custom_input").notNull().default(""),
  summary: text("summary").notNull().default(""),
  keyTechniques: json("key_techniques").$type<string[]>().notNull().default([]),
  emotionalPrinciples: json("emotional_principles").$type<string[]>().notNull().default([]),
  culturalContext: text("cultural_context").notNull().default(""),
  notableWorks: json("notable_works").$type<string[]>().notNull().default([]),
  narrativeLessons: text("narrative_lessons").notNull().default(""),
  themes: json("themes").$type<string[]>().notNull().default([]),
  universalScore: integer("universal_score").notNull().default(0),
  skillsExtracted: boolean("skills_extracted").notNull().default(false),
  extractedSkillIds: json("extracted_skill_ids").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const knowledgeDossiersTable = pgTable("knowledge_dossiers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull(),
  coverInsight: text("cover_insight").notNull().default(""),
  entryIds: json("entry_ids").$type<string[]>().notNull().default([]),
  skillIds: json("skill_ids").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ResearchEntry = typeof researchEntriesTable.$inferSelect;
export type KnowledgeDossier = typeof knowledgeDossiersTable.$inferSelect;
