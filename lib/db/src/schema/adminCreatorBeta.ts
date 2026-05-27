import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { appUsersTable } from "./users";

export const betaInviteCodesTable = pgTable("beta_invite_codes", {
  code: text("code").primaryKey(),
  planGranted: text("plan_granted").notNull().default("premium"),
  durationMonths: integer("duration_months").notNull().default(3),
  maxUses: integer("max_uses").notNull().default(1),
  usesCount: integer("uses_count").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  createdBy: text("created_by").references(() => appUsersTable.id, { onDelete: "set null" }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const betaCodeUsagesTable = pgTable("beta_code_usages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().references(() => betaInviteCodesTable.code, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => appUsersTable.id, { onDelete: "cascade" }),
  usedAt: timestamp("used_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const adminAuditLogTable = pgTable("admin_audit_log", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  adminUserId: text("admin_user_id").notNull().references(() => appUsersTable.id, { onDelete: "cascade" }),
  actionType: text("action_type").notNull(),
  targetUserId: text("target_user_id").references(() => appUsersTable.id, { onDelete: "set null" }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type BetaInviteCode = typeof betaInviteCodesTable.$inferSelect;
export type BetaCodeUsage = typeof betaCodeUsagesTable.$inferSelect;
export type AdminAuditLog = typeof adminAuditLogTable.$inferSelect;
