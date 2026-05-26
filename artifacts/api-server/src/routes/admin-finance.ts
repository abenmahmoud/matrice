import { Router, type IRouter } from "express";
import { count, desc, eq, ilike, isNotNull, or, sql } from "drizzle-orm";
import type Stripe from "stripe";
import {
  appUsersTable,
  db,
  exportJobsTable,
  projectsTable,
  subscriptionsTable,
  workPassportsTable,
} from "@workspace/db";
import { adminAuthMiddleware } from "../middleware/adminAuth.js";
import { stripe } from "../services/stripeService.js";

const router: IRouter = Router();

router.use(adminAuthMiddleware);

function centsToEuroString(cents: number): string {
  return (cents / 100).toFixed(2);
}

function parseDate(value: unknown, fallback: Date): Date {
  if (typeof value !== "string" || value.trim().length === 0) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function requireStripe(): Stripe {
  if (!stripe) {
    throw new Error("STRIPE_NOT_CONFIGURED");
  }
  return stripe;
}

function subscriptionPeriodEnd(subscription: Stripe.Subscription): string | null {
  const withPeriod = subscription as Stripe.Subscription & { current_period_end?: number };
  return withPeriod.current_period_end ? new Date(withPeriod.current_period_end * 1000).toISOString() : null;
}

function subscriptionAmountMonthlyCents(subscription: Stripe.Subscription): number {
  return subscription.items.data.reduce((total, item) => {
    const amount = item.price.unit_amount ?? 0;
    const interval = item.price.recurring?.interval ?? "month";
    const intervalCount = item.price.recurring?.interval_count ?? 1;
    if (interval === "year") return total + amount / (12 * intervalCount);
    if (interval === "month") return total + amount / intervalCount;
    return total + amount;
  }, 0);
}

function customerEmail(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null): string | null {
  return typeof customer === "object" && customer && !customer.deleted ? customer.email ?? null : null;
}

function customerName(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null): string | null {
  return typeof customer === "object" && customer && !customer.deleted ? customer.name ?? null : null;
}

function priceLabel(price: Stripe.Price): string {
  if (price.nickname) return price.nickname;
  if (typeof price.product === "string") return price.product;
  return price.product.deleted ? price.id : price.product.name ?? price.id;
}

function csvCell(value: unknown): string {
  const text = String(value ?? "");
  if (!/[;"\n\r]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function csvLine(values: unknown[]): string {
  return values.map(csvCell).join(";");
}

async function listSucceededCharges(fromDate: Date, toDate: Date): Promise<Stripe.Charge[]> {
  const s = requireStripe();
  const charges = await s.charges.list({
    created: {
      gte: Math.floor(fromDate.getTime() / 1000),
      lte: Math.floor(toDate.getTime() / 1000),
    },
    limit: 100,
    expand: ["data.customer"],
  });
  return charges.data.filter((charge) => charge.status === "succeeded");
}

router.get("/admin/finance/overview", async (req, res) => {
  try {
    const s = requireStripe();
    const subscriptions = await s.subscriptions.list({
      status: "active",
      limit: 100,
      expand: ["data.items.data.price"],
    });

    const mrr = Math.round(subscriptions.data.reduce((total, sub) => total + subscriptionAmountMonthlyCents(sub), 0));
    const startMonth = new Date();
    startMonth.setDate(1);
    startMonth.setHours(0, 0, 0, 0);
    const charges = await listSucceededCharges(startMonth, new Date());
    const caMonth = charges.reduce((sum, charge) => sum + charge.amount, 0);

    res.json({
      mrr_cents: mrr,
      mrr_eur: centsToEuroString(mrr),
      active_subscriptions: subscriptions.data.length,
      ca_month_cents: caMonth,
      ca_month_eur: centsToEuroString(caMonth),
      commissions_cents: 0,
      commissions_eur: "0.00",
    });
  } catch (err) {
    if ((err as Error).message === "STRIPE_NOT_CONFIGURED") {
      res.status(503).json({ error: "Stripe n'est pas configure" });
      return;
    }
    req.log.error({ err }, "Failed to load admin finance overview");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/admin/finance/subscriptions", async (req, res) => {
  try {
    const s = requireStripe();
    const subscriptions = await s.subscriptions.list({
      status: "active",
      limit: 100,
      expand: ["data.customer", "data.items.data.price"],
    });

    const rows = subscriptions.data.map((sub) => {
      const item = sub.items.data[0];
      const price = item?.price;
      const amount = price?.unit_amount ?? 0;
      return {
        subscription_id: sub.id,
        customer_email: customerEmail(sub.customer),
        customer_name: customerName(sub.customer),
        plan: price ? priceLabel(price) : "Abonnement",
        amount_eur: centsToEuroString(amount),
        interval: price?.recurring?.interval ?? null,
        created: new Date(sub.created * 1000).toISOString(),
        current_period_end: subscriptionPeriodEnd(sub),
        cancel_at_period_end: sub.cancel_at_period_end,
      };
    });

    res.json({ subscriptions: rows, count: rows.length });
  } catch (err) {
    if ((err as Error).message === "STRIPE_NOT_CONFIGURED") {
      res.status(503).json({ error: "Stripe n'est pas configure" });
      return;
    }
    req.log.error({ err }, "Failed to list admin finance subscriptions");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/admin/finance/transactions", async (req, res) => {
  try {
    const fromDate = parseDate(req.query["from"], new Date(Date.now() - 30 * 24 * 3600 * 1000));
    const toDate = parseDate(req.query["to"], new Date());
    const rows = (await listSucceededCharges(fromDate, toDate)).map((charge) => ({
      id: charge.id,
      date: new Date(charge.created * 1000).toISOString(),
      customer_email: customerEmail(charge.customer) ?? charge.billing_details.email ?? null,
      amount_eur: centsToEuroString(charge.amount),
      currency: charge.currency.toUpperCase(),
      description: charge.description,
      receipt_url: charge.receipt_url,
      paid: charge.paid,
    }));

    res.json({ transactions: rows, count: rows.length });
  } catch (err) {
    if ((err as Error).message === "STRIPE_NOT_CONFIGURED") {
      res.status(503).json({ error: "Stripe n'est pas configure" });
      return;
    }
    req.log.error({ err }, "Failed to list admin finance transactions");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/admin/finance/export/csv", async (req, res) => {
  try {
    const fromDate = parseDate(req.query["from"], new Date(Date.now() - 90 * 24 * 3600 * 1000));
    const toDate = parseDate(req.query["to"], new Date());
    const charges = await listSucceededCharges(fromDate, toDate);
    const headers = [
      "date",
      "reference",
      "client_email",
      "client_name",
      "description",
      "montant_ht",
      "tva",
      "montant_ttc",
      "devise",
      "mode_paiement",
    ];
    const lines = [csvLine(headers)];

    for (const charge of charges) {
      const tva = (charge.amount * 0.2) / 1.2;
      const ht = charge.amount - tva;
      lines.push(csvLine([
        new Date(charge.created * 1000).toISOString().slice(0, 10),
        charge.id,
        customerEmail(charge.customer) ?? charge.billing_details.email ?? "",
        customerName(charge.customer) ?? charge.billing_details.name ?? "",
        charge.description || "Abonnement Matrice",
        centsToEuroString(ht),
        centsToEuroString(tva),
        centsToEuroString(charge.amount),
        charge.currency.toUpperCase(),
        charge.payment_method_details?.type ?? "card",
      ]));
    }

    const fromLabel = fromDate.toISOString().slice(0, 10);
    const toLabel = toDate.toISOString().slice(0, 10);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="matrice-finance-${fromLabel}-${toLabel}.csv"`);
    res.send(`\uFEFF${lines.join("\n")}`);
  } catch (err) {
    if ((err as Error).message === "STRIPE_NOT_CONFIGURED") {
      res.status(503).json({ error: "Stripe n'est pas configure" });
      return;
    }
    req.log.error({ err }, "Failed to export admin finance CSV");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/admin/finance/vat-report", async (req, res) => {
  try {
    const year = Number.parseInt(String(req.query["year"] ?? ""), 10) || new Date().getFullYear();
    const quarter = Number.parseInt(String(req.query["quarter"] ?? ""), 10) || Math.ceil((new Date().getMonth() + 1) / 3);
    const normalizedQuarter = Math.min(4, Math.max(1, quarter));
    const startMonth = (normalizedQuarter - 1) * 3;
    const from = new Date(year, startMonth, 1);
    const to = new Date(year, startMonth + 3, 0, 23, 59, 59);
    const charges = await listSucceededCharges(from, to);
    const totalTtc = charges.reduce((sum, charge) => sum + charge.amount, 0);
    const tvaCollectee = (totalTtc * 0.2) / 1.2;
    const ht = totalTtc - tvaCollectee;

    res.json({
      period: { year, quarter: normalizedQuarter, from: from.toISOString(), to: to.toISOString() },
      ca_ttc_eur: centsToEuroString(totalTtc),
      ca_ht_eur: centsToEuroString(ht),
      tva_collectee_eur: centsToEuroString(tvaCollectee),
      nb_transactions: charges.length,
    });
  } catch (err) {
    if ((err as Error).message === "STRIPE_NOT_CONFIGURED") {
      res.status(503).json({ error: "Stripe n'est pas configure" });
      return;
    }
    req.log.error({ err }, "Failed to generate VAT report");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/admin/authors", async (req, res) => {
  try {
    const search = typeof req.query["q"] === "string" ? req.query["q"].trim() : "";
    const limit = Math.min(100, Math.max(1, Number.parseInt(String(req.query["limit"] ?? "50"), 10) || 50));
    const offset = Math.max(0, Number.parseInt(String(req.query["offset"] ?? "0"), 10) || 0);
    const where = search
      ? or(ilike(appUsersTable.email, `%${search}%`), ilike(appUsersTable.displayName, `%${search}%`))
      : undefined;

    const users = await db
      .select({
        id: appUsersTable.id,
        email: appUsersTable.email,
        displayName: appUsersTable.displayName,
        role: appUsersTable.role,
        plan: appUsersTable.plan,
        status: appUsersTable.status,
        stripeCustomerId: appUsersTable.stripeCustomerId,
        stripeSubscriptionId: appUsersTable.stripeSubscriptionId,
        createdAt: appUsersTable.createdAt,
      })
      .from(appUsersTable)
      .where(where)
      .orderBy(desc(appUsersTable.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db.select({ total: count() }).from(appUsersTable).where(where);
    const [lockedCounts, projectCounts, exportCounts, subscriptionRows] = await Promise.all([
      db
        .select({ userId: workPassportsTable.ownerUserId, total: sql<number>`count(*)::int` })
        .from(workPassportsTable)
        .where(isNotNull(workPassportsTable.sealedAt))
        .groupBy(workPassportsTable.ownerUserId),
      db
        .select({ userId: projectsTable.ownerUserId, total: sql<number>`count(*)::int` })
        .from(projectsTable)
        .where(isNotNull(projectsTable.ownerUserId))
        .groupBy(projectsTable.ownerUserId),
      db
        .select({ userId: exportJobsTable.userId, total: sql<number>`count(*)::int` })
        .from(exportJobsTable)
        .groupBy(exportJobsTable.userId),
      db.select().from(subscriptionsTable),
    ]);

    const lockedByUser = new Map(lockedCounts.map((row) => [row.userId, Number(row.total)]));
    const projectsByUser = new Map(projectCounts.map((row) => [row.userId, Number(row.total)]));
    const exportsByUser = new Map(exportCounts.map((row) => [row.userId, Number(row.total)]));
    const subscriptionsByUser = new Map(subscriptionRows.map((row) => [row.userId, row]));

    res.json({
      authors: users.map((user) => {
        const subscription = subscriptionsByUser.get(user.id);
        return {
          id: user.id,
          email: user.email,
          display_name: user.displayName,
          role: user.role,
          plan: user.plan,
          status: user.status,
          created_at: user.createdAt,
          projects_count: projectsByUser.get(user.id) ?? 0,
          locked_works_count: lockedByUser.get(user.id) ?? 0,
          exports_count: exportsByUser.get(user.id) ?? 0,
          mandate_signed: false,
          stripe_connect_status: "non_configure",
          payout_balance_eur: "0.00",
          stripe_customer_id: user.stripeCustomerId,
          stripe_subscription_id: user.stripeSubscriptionId,
          subscription_status: subscription?.status ?? null,
          subscription_period_end: subscription?.currentPeriodEnd ?? null,
        };
      }),
      count: users.length,
      total: Number(totalRow?.total ?? 0),
      limit,
      offset,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list admin authors");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/admin/authors/:id", async (req, res) => {
  try {
    const userId = String(req.params.id);
    const [user] = await db.select().from(appUsersTable).where(eq(appUsersTable.id, userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "Auteur introuvable" });
      return;
    }

    const [passports, exports, subscription, projectRows] = await Promise.all([
      db
        .select({
          id: workPassportsTable.id,
          officialTitle: workPassportsTable.officialTitle,
          workType: workPassportsTable.workType,
          sealedAt: workPassportsTable.sealedAt,
          createdAt: workPassportsTable.createdAt,
        })
        .from(workPassportsTable)
        .where(eq(workPassportsTable.ownerUserId, userId))
        .orderBy(desc(workPassportsTable.createdAt))
        .limit(20),
      db
        .select({
          id: exportJobsTable.id,
          format: exportJobsTable.format,
          status: exportJobsTable.status,
          createdAt: exportJobsTable.createdAt,
        })
        .from(exportJobsTable)
        .where(eq(exportJobsTable.userId, userId))
        .orderBy(desc(exportJobsTable.createdAt))
        .limit(20),
      db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, userId)).limit(1),
      db
        .select({ id: projectsTable.id, title: projectsTable.title, createdAt: projectsTable.createdAt })
        .from(projectsTable)
        .where(eq(projectsTable.ownerUserId, userId))
        .orderBy(desc(projectsTable.createdAt))
        .limit(20),
    ]);

    res.json({
      author: {
        id: user.id,
        email: user.email,
        display_name: user.displayName,
        role: user.role,
        plan: user.plan,
        status: user.status,
        created_at: user.createdAt,
        stripe_customer_id: user.stripeCustomerId,
        stripe_subscription_id: user.stripeSubscriptionId,
        stripe_connect_status: "non_configure",
        payout_balance_eur: "0.00",
        mandate_signed: false,
      },
      subscription: subscription[0] ?? null,
      projects: projectRows,
      passports,
      exports,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get admin author details");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
