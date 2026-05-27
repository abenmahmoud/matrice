import { boolean, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { appUsersTable } from "./users";
import { projectsTable } from "./projects";

export type MandateLevel = "simple" | "advanced" | "exclusive";
export type MandateStatus = "draft" | "pending_signature" | "active" | "declined" | "expired" | "revoked";

export const delegationMandateTable = pgTable("delegation_mandate", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => appUsersTable.id, { onDelete: "cascade" }),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),

  essufSignEnvelopeId: text("essuf_sign_envelope_id"),
  authorSignUrl: text("author_sign_url"),
  finalPdfHash: text("final_pdf_hash"),
  otsHash: text("ots_hash"),
  verifyUrl: text("verify_url"),
  signedAt: timestamp("signed_at"),
  declinedAt: timestamp("declined_at"),
  expiredAt: timestamp("expired_at"),

  mandateLevel: text("mandate_level").$type<MandateLevel>().notNull().default("advanced"),
  commissionPercent: integer("commission_percent").notNull().default(15),
  durationMonths: integer("duration_months").notNull().default(12),
  territories: jsonb("territories").$type<string[]>().notNull().default(["monde"]),
  exclusivity: boolean("exclusivity").notNull().default(false),
  status: text("status").$type<MandateStatus>().notNull().default("draft"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type DelegationMandate = typeof delegationMandateTable.$inferSelect;
export type InsertDelegationMandate = typeof delegationMandateTable.$inferInsert;
