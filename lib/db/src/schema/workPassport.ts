import { pgTable, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "drizzle-zod";
import { projectsTable } from "./projects";

export const workPassportTypeEnum = [
  "roman",
  "scenario",
  "film",
  "serie",
  "court-metrage",
  "autre",
] as const;

export const workPassportStatusEnum = [
  "brouillon",
  "en_developpement",
  "pret_depot",
  "depose",
  "soumis",
  "publie",
] as const;

export const depositTargetEnum = [
  "sgdl",
  "inpi_esoleau",
  "sacd",
  "isbn_afnil",
  "cnc",
  "festival",
  "producteur",
  "diffuseur",
  "isan_eidr",
  "autre",
] as const;

export const workPassportsTable = pgTable("work_passports", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  ownerUserId: text("owner_user_id").notNull(),

  // Identite
  officialTitle: text("official_title").notNull().default(""),
  workType: text("work_type").notNull().default("roman"),
  displayedAuthor: text("displayed_author").notNull().default(""),
  pseudonym: text("pseudonym").notNull().default(""),
  language: text("language").notNull().default("francais"),
  countryCulture: text("country_culture").notNull().default(""),
  genre: text("genre").notNull().default(""),
  targetAudience: text("target_audience").notNull().default(""),
  status: text("status").notNull().default("brouillon"),

  // ADN narratif
  logline: text("logline").notNull().default(""),
  shortPitch: text("short_pitch").notNull().default(""),
  shortSynopsis: text("short_synopsis").notNull().default(""),
  mainThemes: jsonb("main_themes").$type<string[]>().notNull().default([]),
  artisticIntention: text("artistic_intention").notNull().default(""),
  declaredOriginality: text("declared_originality").notNull().default(""),
  clichRisks: jsonb("cliche_risks").$type<string[]>().notNull().default([]),

  // Tracabilite
  version: integer("version").notNull().default(1),
  sealedAt: timestamp("sealed_at"),
  contentHash: text("content_hash"),
  legalDisclaimer: text("legal_disclaimer").notNull().default(
    "Ce document ne remplace pas un depot officiel. Il constitue une preuve interne de version et un guide de preparation."
  ),

  // Depot / reconnaissance
  depositTargets: jsonb("deposit_targets").$type<string[]>().notNull().default([]),
  depositChecklist: jsonb("deposit_checklist").$type<Record<string, boolean>>().notNull().default({}),

  // Exports
  markdownContent: text("markdown_content").notNull().default(""),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type WorkPassport = typeof workPassportsTable.$inferSelect;
export type InsertWorkPassport = typeof workPassportsTable.$inferInsert;
