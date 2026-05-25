import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { appUsersTable } from "./users";
import { workPassportsTable } from "./workPassport";

export const exportJobsTable = pgTable("export_jobs", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => appUsersTable.id, { onDelete: "cascade" }),
  workPassportId: text("work_passport_id")
    .notNull()
    .references(() => workPassportsTable.id, { onDelete: "cascade" }),

  format: text("format").notNull(),
  status: text("status").notNull().default("pending"),
  progressPct: integer("progress_pct").default(0),

  outputFilePath: text("output_file_path"),
  outputFileSizeBytes: integer("output_file_size_bytes"),
  outputDownloadToken: text("output_download_token"),
  outputExpiresAt: timestamp("output_expires_at"),

  errorMessage: text("error_message"),

  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ExportJob = typeof exportJobsTable.$inferSelect;
export type InsertExportJob = typeof exportJobsTable.$inferInsert;
