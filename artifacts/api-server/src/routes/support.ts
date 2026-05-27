import { Router, type IRouter } from "express";
import { z } from "zod";
import { and, desc, eq, isNull } from "drizzle-orm";
import { appUsersTable, db, supportMessagesTable, supportTicketsTable } from "@workspace/db";
import { getAuthUser } from "../lib/auth.js";
import { notify } from "../services/notificationService.js";
import { suggestFaqAnswer } from "../services/supportAiService.js";

const router: IRouter = Router();

const ticketInput = z.object({
  subject: z.string().min(3).max(200),
  category: z.enum(["general", "bug", "feature", "billing", "mandate", "export", "account"]).default("general"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  body: z.string().min(5).max(5000),
});

router.post("/support/tickets", async (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user) {
      res.status(401).json({ error: "AUTH_REQUIRED" });
      return;
    }
    const input = ticketInput.parse(req.body);
    const [ticket] = await db.insert(supportTicketsTable).values({
      userId: user.id,
      subject: input.subject,
      category: input.category,
      priority: input.priority,
      status: "open",
    }).returning();

    await db.insert(supportMessagesTable).values({
      ticketId: ticket.id,
      senderUserId: user.id,
      senderType: "user",
      body: input.body,
    });

    const suggestion = await suggestFaqAnswer(`${input.subject}\n\n${input.body}`, input.category);
    if (suggestion) {
      await db.insert(supportMessagesTable).values({
        ticketId: ticket.id,
        senderUserId: null,
        senderType: "ai",
        body: `Suggestion automatique :\n\n${suggestion.answer}\n\nUn humain peut toujours reprendre la conversation si besoin.`,
        metadata: { faq_id: suggestion.faqId, confidence: suggestion.confidence },
      });
      await notify({
        userId: user.id,
        type: "support_reply",
        title: "Suggestion de support disponible",
        body: "Une reponse automatique peut deja t'aider sur ce ticket.",
        actionUrl: `/support/tickets/${ticket.id}`,
        actionLabel: "Voir",
      });
    }

    const admins = await db.select({ id: appUsersTable.id }).from(appUsersTable).where(eq(appUsersTable.role, "owner"));
    for (const admin of admins) {
      await notify({
        userId: admin.id,
        type: "support_reply",
        title: `Nouveau ticket : ${input.subject}`,
        body: `${user.displayName || user.email} a ouvert un ticket ${input.category}.`,
        actionUrl: `/admin/support/${ticket.id}`,
        actionLabel: "Traiter",
      });
    }

    res.status(201).json({ ticket_id: ticket.id });
  } catch (err) {
    req.log.error({ err }, "Failed to create support ticket");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/support/tickets", async (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "AUTH_REQUIRED" });
    return;
  }
  const tickets = await db.select().from(supportTicketsTable).where(eq(supportTicketsTable.userId, user.id)).orderBy(desc(supportTicketsTable.updatedAt));
  res.json({ tickets });
});

router.get("/support/tickets/:id", async (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "AUTH_REQUIRED" });
    return;
  }
  const [ticket] = await db.select().from(supportTicketsTable).where(and(eq(supportTicketsTable.id, req.params["id"]), eq(supportTicketsTable.userId, user.id))).limit(1);
  if (!ticket) {
    res.status(404).json({ error: "NOT_FOUND" });
    return;
  }
  const messages = await db.select().from(supportMessagesTable).where(eq(supportMessagesTable.ticketId, ticket.id)).orderBy(supportMessagesTable.createdAt);
  await db.update(supportMessagesTable).set({ readByUserAt: new Date() }).where(and(eq(supportMessagesTable.ticketId, ticket.id), eq(supportMessagesTable.senderType, "admin"), isNull(supportMessagesTable.readByUserAt)));
  res.json({ ticket, messages });
});

router.post("/support/tickets/:id/messages", async (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "AUTH_REQUIRED" });
    return;
  }
  const input = z.object({ body: z.string().min(1).max(5000) }).parse(req.body);
  const [ticket] = await db.select().from(supportTicketsTable).where(and(eq(supportTicketsTable.id, req.params["id"]), eq(supportTicketsTable.userId, user.id))).limit(1);
  if (!ticket) {
    res.status(404).json({ error: "NOT_FOUND" });
    return;
  }
  if (ticket.status === "closed") {
    res.status(409).json({ error: "TICKET_CLOSED" });
    return;
  }
  const [message] = await db.insert(supportMessagesTable).values({ ticketId: ticket.id, senderUserId: user.id, senderType: "user", body: input.body }).returning({ id: supportMessagesTable.id });
  await db.update(supportTicketsTable).set({ status: ticket.status === "waiting_user" ? "in_progress" : ticket.status, updatedAt: new Date() }).where(eq(supportTicketsTable.id, ticket.id));
  res.status(201).json({ message_id: message.id });
});

export default router;
