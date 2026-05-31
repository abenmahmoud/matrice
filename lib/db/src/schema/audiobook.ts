import { boolean, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { appUsersTable } from "./users";
import { projectsTable } from "./projects";

export const voiceSamplesTable = pgTable("voice_samples", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => appUsersTable.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projectsTable.id, { onDelete: "set null" }),
  displayName: text("display_name").notNull(),
  consentText: text("consent_text").notNull(),
  consentAccepted: boolean("consent_accepted").notNull().default(false),
  samplePath: text("sample_path").notNull(),
  originalFilename: text("original_filename"),
  mimeType: text("mime_type").notNull().default("audio/wav"),
  sizeBytes: integer("size_bytes").notNull().default(0),
  status: text("status").notNull().default("active"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const audioJobsTable = pgTable("audio_jobs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => appUsersTable.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projectsTable.id, { onDelete: "set null" }),
  voiceSampleId: text("voice_sample_id").references(() => voiceSamplesTable.id, { onDelete: "set null" }),
  scope: text("scope").notNull().default("excerpt"),
  status: text("status").notNull().default("queued"),
  engine: text("engine").notNull().default("mock"),
  inputText: text("input_text").notNull(),
  outputPath: text("output_path"),
  watermark: text("watermark").notNull().default("Generated with Matrice Voice Lab"),
  costCredits: integer("cost_credits").notNull().default(0),
  error: text("error"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export type VoiceSample = typeof voiceSamplesTable.$inferSelect;
export type AudioJob = typeof audioJobsTable.$inferSelect;
