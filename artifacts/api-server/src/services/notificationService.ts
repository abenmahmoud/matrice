import { and, count, eq, isNull } from "drizzle-orm";
import { db, notificationPreferencesTable, notificationsTable } from "@workspace/db";
import type { EmailTemplate } from "./emailTemplates.js";
import { shouldSendEmail, type NotificationType } from "./notificationRules.js";
import { sendTransactionalEmail } from "./transactionalEmailService.js";

export async function notify(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string | null;
  actionLabel?: string | null;
  email?: EmailTemplate | null;
  metadata?: Record<string, unknown>;
}): Promise<{ notification_id?: string; email_sent: boolean; email_id?: string }> {
  const [prefs] = await db.select().from(notificationPreferencesTable).where(eq(notificationPreferencesTable.userId, input.userId)).limit(1);
  const inappAll = prefs?.inappAll ?? true;
  let notificationId: string | undefined;

  if (inappAll) {
    const [created] = await db.insert(notificationsTable).values({
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      actionUrl: input.actionUrl ?? null,
      actionLabel: input.actionLabel ?? null,
      metadata: input.metadata ?? {},
    }).returning({ id: notificationsTable.id });
    notificationId = created?.id;
  }

  let emailSent = false;
  let emailId: string | undefined;
  if (input.email && shouldSendEmail(input.type, prefs)) {
    const delivery = await sendTransactionalEmail({ userId: input.userId, templateId: input.type, template: input.email, metadata: input.metadata });
    emailSent = delivery.status === "sent";
    emailId = delivery.emailLogId || undefined;
  }

  return { notification_id: notificationId, email_sent: emailSent, email_id: emailId };
}

export async function markRead(userId: string, notificationId: string): Promise<void> {
  await db.update(notificationsTable).set({ readAt: new Date() }).where(and(eq(notificationsTable.id, notificationId), eq(notificationsTable.userId, userId)));
}

export async function markAllRead(userId: string): Promise<number> {
  const updated = await db
    .update(notificationsTable)
    .set({ readAt: new Date() })
    .where(and(eq(notificationsTable.userId, userId), isNull(notificationsTable.readAt), isNull(notificationsTable.archivedAt)))
    .returning({ id: notificationsTable.id });
  return updated.length;
}

export async function unreadCount(userId: string): Promise<number> {
  const [row] = await db.select({ total: count() }).from(notificationsTable).where(and(eq(notificationsTable.userId, userId), isNull(notificationsTable.readAt), isNull(notificationsTable.archivedAt)));
  return Number(row?.total ?? 0);
}
