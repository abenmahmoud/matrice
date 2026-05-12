import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const experimentalModulesTable = pgTable("experimental_modules", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  minimumPlan: text("minimum_plan").notNull().default("studio"),
  isOwnerOnly: boolean("is_owner_only").notNull().default(false),
  isEnabled: boolean("is_enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ExperimentalModule = typeof experimentalModulesTable.$inferSelect;
export type InsertExperimentalModule = typeof experimentalModulesTable.$inferInsert;
