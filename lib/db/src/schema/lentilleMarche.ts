import { integer, jsonb, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { appUsersTable } from "./users";
import { projectsTable } from "./projects";

export type LentilleScores = {
  microdrama: number;
  ai_prod: number;
  pression_spatiale: number;
  perso_deplace: number;
  hybridation: number;
  global: number;
};

export type LentilleDiagnostic = {
  points: string[];
};

export type LentilleProposition = {
  axe: string;
  proposition: string;
  impact: string;
};

export type LentilleMicrodramaVersion = {
  episodes: Array<{
    title: string;
    summary: string;
    cliffhanger: string;
  }>;
};

export type LentilleBudgetEstimate = {
  tier: "micro" | "low" | "medium" | "high";
  breakdown: {
    decors: string;
    personnages: string;
    jours_tournage: string;
  };
  total_eur_range: [number, number];
};

export type LentilleHybridationProposal = {
  genre_porte: string;
  theme_profond: string;
  exemple: string;
};

export const lentilleAnalysesTable = pgTable("lentille_analyses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => appUsersTable.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projectsTable.id, { onDelete: "cascade" }),

  inputLogline: text("input_logline").notNull(),
  inputSynopsis: text("input_synopsis").notNull(),
  inputGenre: text("input_genre"),
  inputFormatTarget: text("input_format_target"),

  scoreMicrodrama: integer("score_microdrama").notNull(),
  scoreAiProd: integer("score_ai_prod").notNull(),
  scorePressionSpatiale: integer("score_pression_spatiale").notNull(),
  scorePersoDeplace: integer("score_perso_deplace").notNull(),
  scoreHybridation: integer("score_hybridation").notNull(),
  scoreGlobal: integer("score_global").notNull(),

  diagnosticCompatible: jsonb("diagnostic_compatible").$type<LentilleDiagnostic>().notNull(),
  diagnosticRenforcer: jsonb("diagnostic_renforcer").$type<LentilleDiagnostic>().notNull(),
  propositions: jsonb("propositions").$type<LentilleProposition[]>().notNull(),
  hook10s: text("hook_10s").notNull(),
  microdramaVersion: jsonb("microdrama_version").$type<LentilleMicrodramaVersion>().notNull(),
  budgetEstimate: jsonb("budget_estimate").$type<LentilleBudgetEstimate>().notNull(),
  hybridationProposal: jsonb("hybridation_proposal").$type<LentilleHybridationProposal>().notNull(),
  formatRecommendation: text("format_recommendation").notNull(),
  formatReasoning: text("format_reasoning").notNull(),

  modelUsed: text("model_used").notNull().default("deepseek-chat"),
  tokensUsed: integer("tokens_used").notNull(),
  costEur: numeric("cost_eur", { precision: 10, scale: 6 }).notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type LentilleAnalysis = typeof lentilleAnalysesTable.$inferSelect;
export type InsertLentilleAnalysis = typeof lentilleAnalysesTable.$inferInsert;
