import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { projectsTable } from "./projects";
import { appUsersTable } from "./users";

export const salesEntriesTable = pgTable("sales_entries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => appUsersTable.id, { onDelete: "cascade" }),
  channel: text("channel").notNull(),
  saleDate: timestamp("sale_date").notNull(),
  grossAmountCents: integer("gross_amount_cents").notNull(),
  currency: text("currency").notNull().default("EUR"),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type SalesEntry = typeof salesEntriesTable.$inferSelect;
export type InsertSalesEntry = typeof salesEntriesTable.$inferInsert;
