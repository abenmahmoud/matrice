import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { appUsersTable } from "./users";

export const communityThreadsTable = pgTable("community_threads", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  authorUserId: text("author_user_id")
    .notNull()
    .references(() => appUsersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category").notNull().default("general"),
  body: text("body").notNull().default(""),
  status: text("status").notNull().default("open"), // open | closed | hidden
  pinned: boolean("pinned").notNull().default(false),
  postsCount: integer("posts_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const communityPostsTable = pgTable("community_posts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  threadId: text("thread_id")
    .notNull()
    .references(() => communityThreadsTable.id, { onDelete: "cascade" }),
  authorUserId: text("author_user_id")
    .notNull()
    .references(() => appUsersTable.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  status: text("status").notNull().default("visible"), // visible | hidden
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CommunityThread = typeof communityThreadsTable.$inferSelect;
export type InsertCommunityThread = typeof communityThreadsTable.$inferInsert;
export type CommunityPost = typeof communityPostsTable.$inferSelect;
export type InsertCommunityPost = typeof communityPostsTable.$inferInsert;
