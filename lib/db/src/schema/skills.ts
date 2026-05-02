import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { projectsTable } from "./projects";

export const narrativeSkillsTable = pgTable("narrative_skills", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  promptContent: text("prompt_content").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  isGlobal: boolean("is_global").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const projectSkillsTable = pgTable("project_skills", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  skillId: text("skill_id").notNull().references(() => narrativeSkillsTable.id, { onDelete: "cascade" }),
  activatedAt: timestamp("activated_at").notNull().defaultNow(),
});

export type NarrativeSkill = typeof narrativeSkillsTable.$inferSelect;
export type NewNarrativeSkill = typeof narrativeSkillsTable.$inferInsert;
export type ProjectSkill = typeof projectSkillsTable.$inferSelect;
