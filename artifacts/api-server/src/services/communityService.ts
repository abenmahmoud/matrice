import { and, asc, desc, eq, sql } from "drizzle-orm";
import {
  db,
  communityThreadsTable,
  communityPostsTable,
  appUsersTable,
} from "@workspace/db";

const CATEGORIES = ["general", "entraide", "extraits", "annonces", "feedback"] as const;
export type CommunityCategory = (typeof CATEGORIES)[number];

export function isValidCategory(value: string): value is CommunityCategory {
  return (CATEGORIES as readonly string[]).includes(value);
}

export function listCategories(): readonly string[] {
  return CATEGORIES;
}

const threadSelection = {
  id: communityThreadsTable.id,
  title: communityThreadsTable.title,
  category: communityThreadsTable.category,
  body: communityThreadsTable.body,
  status: communityThreadsTable.status,
  pinned: communityThreadsTable.pinned,
  postsCount: communityThreadsTable.postsCount,
  authorUserId: communityThreadsTable.authorUserId,
  authorName: appUsersTable.displayName,
  createdAt: communityThreadsTable.createdAt,
  updatedAt: communityThreadsTable.updatedAt,
};

export async function listThreads(opts: { includeHidden?: boolean } = {}) {
  const rows = await db
    .select(threadSelection)
    .from(communityThreadsTable)
    .leftJoin(appUsersTable, eq(appUsersTable.id, communityThreadsTable.authorUserId))
    .orderBy(desc(communityThreadsTable.pinned), desc(communityThreadsTable.updatedAt));
  return opts.includeHidden ? rows : rows.filter((row) => row.status !== "hidden");
}

export async function getThreadWithPosts(threadId: string, opts: { includeHidden?: boolean } = {}) {
  const [thread] = await db
    .select(threadSelection)
    .from(communityThreadsTable)
    .leftJoin(appUsersTable, eq(appUsersTable.id, communityThreadsTable.authorUserId))
    .where(eq(communityThreadsTable.id, threadId))
    .limit(1);
  if (!thread) return null;
  if (thread.status === "hidden" && !opts.includeHidden) return null;

  const posts = await db
    .select({
      id: communityPostsTable.id,
      threadId: communityPostsTable.threadId,
      body: communityPostsTable.body,
      status: communityPostsTable.status,
      authorUserId: communityPostsTable.authorUserId,
      authorName: appUsersTable.displayName,
      createdAt: communityPostsTable.createdAt,
      updatedAt: communityPostsTable.updatedAt,
    })
    .from(communityPostsTable)
    .leftJoin(appUsersTable, eq(appUsersTable.id, communityPostsTable.authorUserId))
    .where(eq(communityPostsTable.threadId, threadId))
    .orderBy(asc(communityPostsTable.createdAt));

  const visiblePosts = opts.includeHidden ? posts : posts.filter((post) => post.status !== "hidden");
  return { thread, posts: visiblePosts };
}

export async function getThreadRow(threadId: string) {
  const [thread] = await db
    .select()
    .from(communityThreadsTable)
    .where(eq(communityThreadsTable.id, threadId))
    .limit(1);
  return thread ?? null;
}

export async function createThread(input: {
  authorUserId: string;
  title: string;
  category: string;
  body: string;
}) {
  const [created] = await db
    .insert(communityThreadsTable)
    .values({
      authorUserId: input.authorUserId,
      title: input.title,
      category: input.category,
      body: input.body,
    })
    .returning();
  return created;
}

export async function createPost(input: { threadId: string; authorUserId: string; body: string }) {
  const [created] = await db
    .insert(communityPostsTable)
    .values({ threadId: input.threadId, authorUserId: input.authorUserId, body: input.body })
    .returning();
  await db
    .update(communityThreadsTable)
    .set({
      postsCount: sql`${communityThreadsTable.postsCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(communityThreadsTable.id, input.threadId));
  return created;
}

export async function setThreadStatus(threadId: string, status: "open" | "closed" | "hidden") {
  const [updated] = await db
    .update(communityThreadsTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(communityThreadsTable.id, threadId))
    .returning();
  return updated ?? null;
}

export async function setThreadPinned(threadId: string, pinned: boolean) {
  const [updated] = await db
    .update(communityThreadsTable)
    .set({ pinned, updatedAt: new Date() })
    .where(eq(communityThreadsTable.id, threadId))
    .returning();
  return updated ?? null;
}

export async function setPostStatus(postId: string, status: "visible" | "hidden") {
  const [updated] = await db
    .update(communityPostsTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(communityPostsTable.id, postId))
    .returning();
  return updated ?? null;
}

export async function getPostRow(postId: string) {
  const [post] = await db
    .select()
    .from(communityPostsTable)
    .where(eq(communityPostsTable.id, postId))
    .limit(1);
  return post ?? null;
}
