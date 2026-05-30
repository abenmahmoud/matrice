import { boolean, integer, jsonb, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { appUsersTable } from "./users";

export const userOnboardingProgressTable = pgTable("user_onboarding_progress", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => appUsersTable.id, { onDelete: "cascade" }),
  stepId: text("step_id").notNull(),
  status: text("status").notNull().default("pending"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  skippedAt: timestamp("skipped_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userStepUnique: unique("user_onboarding_progress_user_step_unique").on(table.userId, table.stepId),
}));

export const notificationsTable = pgTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => appUsersTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  actionUrl: text("action_url"),
  actionLabel: text("action_label"),
  readAt: timestamp("read_at"),
  archivedAt: timestamp("archived_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const emailLogTable = pgTable("email_log", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => appUsersTable.id, { onDelete: "set null" }),
  templateId: text("template_id").notNull(),
  recipientEmail: text("recipient_email").notNull(),
  subject: text("subject").notNull(),
  resendMessageId: text("resend_message_id"),
  status: text("status").notNull().default("pending"),
  error: text("error"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notificationPreferencesTable = pgTable("notification_preferences", {
  userId: text("user_id").primaryKey().references(() => appUsersTable.id, { onDelete: "cascade" }),
  emailMandateEvents: boolean("email_mandate_events").notNull().default(true),
  emailExportReady: boolean("email_export_ready").notNull().default(true),
  emailLentilleDone: boolean("email_lentille_done").notNull().default(true),
  emailBetaWarnings: boolean("email_beta_warnings").notNull().default(true),
  emailSupportReply: boolean("email_support_reply").notNull().default(true),
  emailProductUpdates: boolean("email_product_updates").notNull().default(true),
  inappAll: boolean("inapp_all").notNull().default(true),
  digestFrequency: text("digest_frequency").notNull().default("realtime"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const supportTicketsTable = pgTable("support_tickets", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => appUsersTable.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  category: text("category").notNull().default("general"),
  priority: text("priority").notNull().default("normal"),
  status: text("status").notNull().default("open"),
  assignedAdminId: text("assigned_admin_id").references(() => appUsersTable.id, { onDelete: "set null" }),
  source: text("source").notNull().default("in_app"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  firstResponseAt: timestamp("first_response_at"),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const supportMessagesTable = pgTable("support_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  ticketId: text("ticket_id").notNull().references(() => supportTicketsTable.id, { onDelete: "cascade" }),
  senderUserId: text("sender_user_id").references(() => appUsersTable.id, { onDelete: "set null" }),
  senderType: text("sender_type").notNull(),
  body: text("body").notNull(),
  attachments: jsonb("attachments").$type<Array<Record<string, unknown>>>().default([]),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  readByUserAt: timestamp("read_by_user_at"),
  readByAdminAt: timestamp("read_by_admin_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const supportFaqTable = pgTable("support_faq", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  category: text("category").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  embedding: jsonb("embedding").$type<number[]>(),
  usesCount: integer("uses_count").notNull().default(0),
  helpfulCount: integer("helpful_count").notNull().default(0),
  unhelpfulCount: integer("unhelpful_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type UserOnboardingProgress = typeof userOnboardingProgressTable.$inferSelect;
export type Notification = typeof notificationsTable.$inferSelect;
export type NotificationPreferences = typeof notificationPreferencesTable.$inferSelect;
export type SupportTicket = typeof supportTicketsTable.$inferSelect;
export type SupportMessage = typeof supportMessagesTable.$inferSelect;
export type SupportFaq = typeof supportFaqTable.$inferSelect;
