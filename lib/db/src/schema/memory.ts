import { boolean, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const creativeMemoryEntriesTable = pgTable("creative_memory_entries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  category: text("category").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  priority: integer("priority").notNull().default(50),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CreativeMemoryEntry = typeof creativeMemoryEntriesTable.$inferSelect;
export type InsertCreativeMemoryEntry = typeof creativeMemoryEntriesTable.$inferInsert;
