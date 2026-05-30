import { randomUUID } from "node:crypto";
import { db, userOnboardingProgressTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { computeOnboardingProgress, ONBOARDING_STEPS } from "./onboardingProgress.js";

export { computeOnboardingProgress, ONBOARDING_STEPS } from "./onboardingProgress.js";

export async function getUserProgress(userId: string) {
  const progress = await db
    .select()
    .from(userOnboardingProgressTable)
    .where(eq(userOnboardingProgressTable.userId, userId));

  return computeOnboardingProgress(progress);
}

export async function markStepCompleted(userId: string, stepId: string, metadata: Record<string, unknown> = {}): Promise<void> {
  const now = new Date();
  await db
    .insert(userOnboardingProgressTable)
    .values({
      id: randomUUID(),
      userId,
      stepId,
      status: "completed",
      startedAt: now,
      completedAt: now,
      metadata,
    })
    .onConflictDoUpdate({
      target: [userOnboardingProgressTable.userId, userOnboardingProgressTable.stepId],
      set: { status: "completed", completedAt: now, updatedAt: now, metadata },
    });
}

export async function markStepSkipped(userId: string, stepId: string): Promise<void> {
  const now = new Date();
  await db
    .insert(userOnboardingProgressTable)
    .values({ id: randomUUID(), userId, stepId, status: "skipped", skippedAt: now })
    .onConflictDoUpdate({
      target: [userOnboardingProgressTable.userId, userOnboardingProgressTable.stepId],
      set: { status: "skipped", skippedAt: now, updatedAt: now },
    });
}

export async function ensureWelcomeStep(userId: string): Promise<void> {
  await db
    .insert(userOnboardingProgressTable)
    .values({ id: randomUUID(), userId, stepId: "welcome", status: "in_progress", startedAt: new Date() })
    .onConflictDoNothing();
}
