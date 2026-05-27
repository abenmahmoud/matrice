import { randomUUID } from "node:crypto";
import { appUsersTable, db, emailLogTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { EmailTemplate } from "./emailTemplates.js";

function fromAddress(): string {
  return process.env["MATRICE_EMAIL_FROM"] ?? `${process.env["MATRICE_FROM_NAME"] ?? "Matrice"} <${process.env["MATRICE_FROM_EMAIL"] ?? "onboarding@resend.dev"}>`;
}

export async function sendTransactionalEmail(input: {
  userId?: string | null;
  to?: string | null;
  templateId: string;
  template: EmailTemplate;
  metadata?: Record<string, unknown>;
}): Promise<{ emailLogId: string; status: "sent" | "failed" | "skipped"; providerId?: string | null }> {
  let recipientEmail = input.to ?? null;
  if (!recipientEmail && input.userId) {
    const [user] = await db.select({ email: appUsersTable.email }).from(appUsersTable).where(eq(appUsersTable.id, input.userId)).limit(1);
    recipientEmail = user?.email ?? null;
  }
  if (!recipientEmail) {
    return { emailLogId: "", status: "skipped" };
  }

  const emailLogId = randomUUID();
  await db.insert(emailLogTable).values({
    id: emailLogId,
    userId: input.userId ?? null,
    templateId: input.templateId,
    recipientEmail,
    subject: input.template.subject,
    status: "pending",
    metadata: input.metadata ?? {},
  });

  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    await db.update(emailLogTable).set({ status: "failed", error: "RESEND_API_KEY missing" }).where(eq(emailLogTable.id, emailLogId));
    return { emailLogId, status: "skipped" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromAddress(),
        to: recipientEmail,
        subject: input.template.subject,
        html: input.template.html,
        text: input.template.text,
      }),
    });
    const payload = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;
    if (!response.ok) {
      await db.update(emailLogTable).set({ status: "failed", error: payload?.message ?? `Resend HTTP ${response.status}` }).where(eq(emailLogTable.id, emailLogId));
      return { emailLogId, status: "failed" };
    }
    await db.update(emailLogTable).set({ status: "sent", resendMessageId: payload?.id ?? null, sentAt: new Date() }).where(eq(emailLogTable.id, emailLogId));
    return { emailLogId, status: "sent", providerId: payload?.id ?? null };
  } catch (err) {
    await db.update(emailLogTable).set({ status: "failed", error: err instanceof Error ? err.message : "Unknown email error" }).where(eq(emailLogTable.id, emailLogId));
    return { emailLogId, status: "failed" };
  }
}
