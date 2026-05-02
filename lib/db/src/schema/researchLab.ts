import { pgTable, text, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";

export const researchEntriesTable = pgTable("research_entries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  era: text("era").notNull(),
  eraLabel: text("era_label").notNull(),
  eraStart: integer("era_start"),
  eraEnd: integer("era_end"),
  culture: text("culture").notNull(),
  cultureLabel: text("culture_label").notNull(),
  medium: text("medium").notNull(),
  summary: text("summary").notNull().default(""),
  keyTechniques: json("key_techniques").$type<string[]>().notNull().default([]),
  emotionalPrinciples: json("emotional_principles").$type<string[]>().notNull().default([]),
  culturalContext: text("cultural_context").notNull().default(""),
  notableWorks: json("notable_works").$type<string[]>().notNull().default([]),
  narrativeLessons: text("narrative_lessons").notNull().default(""),
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
