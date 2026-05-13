import { pgTable, text, timestamp, jsonb, integer, numeric } from "drizzle-orm/pg-core";
 
import { pgTable, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
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

  // Preuve d'anteriorite - architecture ouverte pour futurs tiers de confiance.
  proofMode: text("proof_mode").notNull().default("internal_hash"),
  proofProvider: text("proof_provider").notNull().default("Matrice Narrative"),
  proofExternalReference: text("proof_external_reference").notNull().default(""),
  proofRegisteredAt: timestamp("proof_registered_at"),
  proofNotes: text("proof_notes").notNull().default(
    "Preuve interne par empreinte SHA-256. Pour une force probante externe, deposer l'oeuvre via INPI e-Soleau, SACD, SGDL ou un service d'horodatage qualifie adapte."
  ),

  // Depot / reconnaissance
  depositTargets: jsonb("deposit_targets").$type<string[]>().notNull().default([]),
  depositChecklist: jsonb("deposit_checklist").$type<Record<string, boolean>>().notNull().default({}),

  // Exports
  markdownContent: text("markdown_content").notNull().default(""),

  certificationLevel: integer("certification_level").notNull().default(1),
  aiContributionScore: numeric("ai_contribution_score").notNull().default(0.5),
  c2paManifest: text("c2pa_manifest"),
  otsProof: text("ots_proof"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type WorkPassport = typeof workPassportsTable.$inferSelect;
export type InsertWorkPassport = typeof workPassportsTable.$inferInsert;
