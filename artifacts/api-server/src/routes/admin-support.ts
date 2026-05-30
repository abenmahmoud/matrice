import { Router, type IRouter } from "express";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { appUsersTable, db, supportMessagesTable, supportTicketsTable } from "@workspace/db";
import { getAuthUser, requireAdmin } from "../lib/auth.js";
import { supportReplyEmail } from "../services/emailTemplates.js";
import { notify } from "../services/notificationService.js";

const router: IRouter = Router();
router.use("/admin", requireAdmin);

router.get("/admin/support/tickets", async (req, res) => {
  const params = z.object({
    status: z.string().optional(),
    priority: z.string().optional(),
    category: z.string().optional(),
  }).parse(req.query);
  const conditions = [
    params.status ? eq(supportTicketsTable.status, params.status) : undefined,
    params.priority ? eq(supportTicketsTable.priority, params.priority) : undefined,
    params.category ? eq(supportTicketsTable.category, params.category) : undefined,
  ].filter(Boolean) as ReturnType<typeof eq>[];
  const query = db.select().from(supportTicketsTable);
  const tickets = conditions.length > 0
    ? await query.where(and(...conditions)).orderBy(desc(supportTicketsTable.updatedAt)).limit(100)
    : await query.orderBy(desc(supportTicketsTable.updatedAt)).limit(100);
  res.json({ tickets });
});

router.get("/admin/support/tickets/:id", async (req, res) => {
  const [ticket] = await db.select().from(supportTicketsTable).where(eq(supportTicketsTable.id, req.params["id"])).limit(1);
  if (!ticket) {
    res.status(404).json({ error: "NOT_FOUND" });
    return;
  }
  const messages = await db.select().from(supportMessagesTable).where(eq(supportMessagesTable.ticketId, ticket.id)).orderBy(supportMessagesTable.createdAt);
  await db.update(supportMessagesTable).set({ readByAdminAt: new Date() }).where(and(eq(supportMessagesTable.ticketId, ticket.id), eq(supportMessagesTable.senderType, "user")));
  res.json({ ticket, messages });
});

router.post("/admin/support/tickets/:id/messages", async (req, res) => {
  const admin = getAuthUser(req)!;
  const input = z.object({ body: z.string().min(1).max(5000) }).parse(req.body);
  const [ticket] = await db.select().from(supportTicketsTable).where(eq(supportTicketsTable.id, req.params["id"])).limit(1);
  if (!ticket) {
    res.status(404).json({ error: "NOT_FOUND" });
    return;
  }
  if (ticket.status === "closed") {
    res.status(409).json({ error: "TICKET_CLOSED" });
    return;
  }
  const [message] = await db.insert(supportMessagesTable).values({ ticketId: ticket.id, senderUserId: admin.id, senderType: "admin", body: input.body }).returning({ id: supportMessagesTable.id });
  await db.update(supportTicketsTable).set({
    status: "waiting_user",
    assignedAdminId: ticket.assignedAdminId ?? admin.id,
    firstResponseAt: ticket.firstResponseAt ?? new Date(),
    updatedAt: new Date(),
  }).where(eq(supportTicketsTable.id, ticket.id));

  const [user] = await db.select().from(appUsersTable).where(eq(appUsersTable.id, ticket.userId)).limit(1);
  if (user) {
    await notify({
      userId: user.id,
      type: "support_reply",
      title: "Nouvelle reponse du support",
      body: `Reponse sur : ${ticket.subject}`,
      actionUrl: `/support/tickets/${ticket.id}`,
      actionLabel: "Repondre",
      email: supportReplyEmail({
        displayName: user.displayName || user.email,
        ticketSubject: ticket.subject,
        replyBody: input.body,
        ticketUrl: `${process.env["MATRICE_BASE_URL"] ?? "https://matrice.essuf.fr"}/support/tickets/${ticket.id}`,
      }),
    });
  }
  res.status(201).json({ message_id: message.id });
});

router.post("/admin/support/tickets/:id/assign", async (req, res) => {
  const admin = getAuthUser(req)!;
  await db.update(supportTicketsTable).set({ assignedAdminId: admin.id, status: "in_progress", updatedAt: new Date() }).where(eq(supportTicketsTable.id, req.params["id"]));
  res.json({ ok: true });
});

router.post("/admin/support/tickets/:id/status", async (req, res) => {
  const input = z.object({ status: z.enum(["open", "in_progress", "waiting_user", "resolved", "closed"]) }).parse(req.body);
  const now = new Date();
  await db.update(supportTicketsTable).set({
    status: input.status,
    resolvedAt: input.status === "resolved" ? now : undefined,
    closedAt: input.status === "closed" ? now : undefined,
    updatedAt: now,
  }).where(eq(supportTicketsTable.id, req.params["id"]));
  res.json({ ok: true });
});

export default router;
