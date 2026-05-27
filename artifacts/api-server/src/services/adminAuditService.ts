import { adminAuditLogTable, db } from "@workspace/db";

export async function logAdminAction(input: {
  adminUserId: string;
  actionType: string;
  targetUserId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}): Promise<void> {
  await db.insert(adminAuditLogTable).values({
    adminUserId: input.adminUserId,
    actionType: input.actionType,
    targetUserId: input.targetUserId ?? null,
    metadata: input.metadata ?? {},
    ipAddress: input.ipAddress ?? null,
  });
}
