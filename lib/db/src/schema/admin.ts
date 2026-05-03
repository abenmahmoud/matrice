import { pgTable, text, boolean, integer, jsonb, timestamp } from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// AI Skills — blocs de savoir injectés dans les prompts IA
// ---------------------------------------------------------------------------

export const aiSkillsTable = pgTable("ai_skills", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull().default(""),
  content: text("content").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  priority: integer("priority").notNull().default(50),
  injectionContexts: jsonb("injection_contexts").$type<string[]>().notNull().default([]),
  usageCount: integer("usage_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type AiSkill = typeof aiSkillsTable.$inferSelect;
export type InsertAiSkill = typeof aiSkillsTable.$inferInsert;

// ---------------------------------------------------------------------------
// Cinema Knowledge — base de connaissances cinéma mondial
// ---------------------------------------------------------------------------

export const cinemaKnowledgeTable = pgTable("cinema_knowledge", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  country: text("country").notNull(),
  region: text("region").notNull().default(""),
  era: text("era").notNull(),
  movement: text("movement").notNull().default(""),
  director: text("director").notNull().default(""),
  films: jsonb("films").$type<string[]>().notNull().default([]),
  techniques: jsonb("techniques").$type<string[]>().notNull().default([]),
  culturalContext: text("cultural_context").notNull().default(""),
  narrativeSignatures: text("narrative_signatures").notNull().default(""),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type CinemaKnowledge = typeof cinemaKnowledgeTable.$inferSelect;
export type InsertCinemaKnowledge = typeof cinemaKnowledgeTable.$inferInsert;
