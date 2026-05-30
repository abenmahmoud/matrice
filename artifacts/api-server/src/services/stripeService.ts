import Stripe from "stripe";
import { db, appUsersTable, subscriptionsTable, invoicesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { renewMonthlyCredits, grantCredits, CREDIT_PACKS } from "./creditsService.js";

// ---------------------------------------------------------------------------
// Stripe Configuration (optionnel)
// ---------------------------------------------------------------------------

const stripeSecretKey = process.env["STRIPE_SECRET_KEY"];
let stripe: Stripe | null = null;

if (stripeSecretKey) {
  try {
    stripe = new Stripe(stripeSecretKey, { apiVersion: "2026-05-01" as Stripe.LatestApiVersion });
    console.log("[Stripe] Initialized successfully");
  } catch (err) {
    console.warn("[Stripe] Failed to initialize:", err);
  }
} else {
  console.warn("[Stripe] STRIPE_SECRET_KEY not configured — payment features disabled");
}

export { stripe };

function ensureStripe(): Stripe {
  if (!stripe) {
    throw new Error("Stripe n'est pas configure. Ajoutez STRIPE_SECRET_KEY dans le .env");
  }
  return stripe;
}

// ---------------------------------------------------------------------------
// Grille tarifaire — abonnements (mensuel/annuel) + packs de recharge
// ---------------------------------------------------------------------------

export type BillingPlan = "studio" | "premium";
export type BillingInterval = "monthly" | "yearly";
export type CreditPack = "pack_100" | "pack_300" | "pack_1000";

// Price IDs Stripe (definis dans le .env / docker-compose).
const SUBSCRIPTION_PRICES: Record<string, string> = {
  studio_monthly: process.env["STRIPE_PRICE_STUDIO_MONTHLY"] || "",
  studio_yearly: process.env["STRIPE_PRICE_STUDIO_YEARLY"] || "",
  premium_monthly: process.env["STRIPE_PRICE_PREMIUM_MONTHLY"] || "",
  premium_yearly: process.env["STRIPE_PRICE_PREMIUM_YEARLY"] || "",
};

const PACK_PRICES: Record<CreditPack, string> = {
  pack_100: process.env["STRIPE_PRICE_CREDITS_100"] || "",
  pack_300: process.env["STRIPE_PRICE_CREDITS_300"] || "",
  pack_1000: process.env["STRIPE_PRICE_CREDITS_1000"] || "",
};

const PUBLIC_BASE_URL = process.env["MATRICE_PUBLIC_BASE_URL"] || "https://matrice.essuf.fr";

// ---------------------------------------------------------------------------
// Checkout — Abonnement (studio/premium x mensuel/annuel)
// ---------------------------------------------------------------------------

export async function createSubscriptionCheckout(
  userId: string,
  email: string,
  plan: BillingPlan,
  interval: BillingInterval,
): Promise<Stripe.Checkout.Session> {
  const s = ensureStripe();

  const customerId = await ensureCustomer(s, userId, email);
  const priceKey = `${plan}_${interval}`;
  const priceId = SUBSCRIPTION_PRICES[priceKey];
  if (!priceId) throw new Error(`Price ID manquant pour ${priceKey}`);

  return s.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${PUBLIC_BASE_URL}/billing?success=true`,
    cancel_url: `${PUBLIC_BASE_URL}/pricing?canceled=true`,
    metadata: { userId, plan, interval },
    subscription_data: { metadata: { userId, plan, interval } },
    tax_id_collection: { enabled: true },
    automatic_tax: { enabled: true },
  });
}

// ---------------------------------------------------------------------------
// Checkout — Pack de recharge (paiement unique, credits permanents)
// ---------------------------------------------------------------------------

export async function createCreditPackCheckout(
  userId: string,
  email: string,
  pack: CreditPack,
): Promise<Stripe.Checkout.Session> {
  const s = ensureStripe();

  const customerId = await ensureCustomer(s, userId, email);
  const priceId = PACK_PRICES[pack];
  if (!priceId) throw new Error(`Price ID manquant pour ${pack}`);

  return s.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "payment",
    success_url: `${PUBLIC_BASE_URL}/billing?recharge=true`,
    cancel_url: `${PUBLIC_BASE_URL}/pricing?canceled=true`,
    metadata: { userId, pack },
    payment_intent_data: { metadata: { userId, pack } },
    tax_id_collection: { enabled: true },
    automatic_tax: { enabled: true },
  });
}

async function ensureCustomer(s: Stripe, userId: string, email: string): Promise<string> {
  let customerId = await getStripeCustomerId(userId);
  if (!customerId) {
    const customer = await s.customers.create({ email, metadata: { userId } });
    customerId = customer.id;
    await db.update(appUsersTable).set({ stripeCustomerId: customerId }).where(eq(appUsersTable.id, userId));
  }
  return customerId;
}

// ---------------------------------------------------------------------------
// Customer Portal
// ---------------------------------------------------------------------------

export async function createCustomerPortalSession(userId: string): Promise<string> {
  const s = ensureStripe();
  const customerId = await getStripeCustomerId(userId);
  if (!customerId) throw new Error("No Stripe customer found");
  const session = await s.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${PUBLIC_BASE_URL}/billing`,
  });
  return session.url;
}

// ---------------------------------------------------------------------------
// Subscription Management
// ---------------------------------------------------------------------------

export async function getUserSubscription(userId: string) {
  const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, userId)).limit(1);
  return sub || null;
}

export async function cancelSubscription(userId: string) {
  const s = ensureStripe();
  const sub = await getUserSubscription(userId);
  if (!sub?.stripeSubscriptionId) throw new Error("No active subscription");
  await s.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: true });
  await db.update(subscriptionsTable).set({ cancelAtPeriodEnd: 1 }).where(eq(subscriptionsTable.id, sub.id));
  return { status: "canceling_at_period_end" };
}

export async function reactivateSubscription(userId: string) {
  const s = ensureStripe();
  const sub = await getUserSubscription(userId);
  if (!sub?.stripeSubscriptionId) throw new Error("No subscription to reactivate");
  await s.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: false });
  await db.update(subscriptionsTable).set({ cancelAtPeriodEnd: 0 }).where(eq(subscriptionsTable.id, sub.id));
  return { status: "reactivated" };
}

// ---------------------------------------------------------------------------
// Invoice Management
// ---------------------------------------------------------------------------

export async function getUserInvoices(userId: string) {
  const s = ensureStripe();
  const customerId = await getStripeCustomerId(userId);
  if (!customerId) return [];
  const stripeInvoices = await s.invoices.list({ customer: customerId, limit: 100 });
  return stripeInvoices.data;
}

type InvoiceWithSub = Stripe.Invoice & {
  subscription_details?: { metadata?: Record<string, string> };
};

export async function syncInvoiceToDB(stripeInvoice: Stripe.Invoice) {
  const invoiceWithDetails = stripeInvoice as InvoiceWithSub;
  const userId = invoiceWithDetails.subscription_details?.metadata?.userId ?? stripeInvoice.metadata?.userId;
  if (!userId) return;
  const amount = (stripeInvoice.total / 100).toFixed(2);
  await db.insert(invoicesTable).values({
    userId,
    stripeInvoiceId: stripeInvoice.id,
    stripeCustomerId: stripeInvoice.customer as string,
    amount: amount as any,
    currency: stripeInvoice.currency || "eur",
    status: stripeInvoice.status || "draft",
    description: stripeInvoice.description || "Abonnement Matrice",
    periodStart: stripeInvoice.period_start ? new Date(stripeInvoice.period_start * 1000) : null,
    periodEnd: stripeInvoice.period_end ? new Date(stripeInvoice.period_end * 1000) : null,
    pdfUrl: stripeInvoice.invoice_pdf || null,
  }).onConflictDoUpdate({
    target: invoicesTable.stripeInvoiceId,
    set: { status: stripeInvoice.status || "draft", pdfUrl: stripeInvoice.invoice_pdf || null, updatedAt: new Date() },
  });
}

// ---------------------------------------------------------------------------
// Webhook Handlers
// ---------------------------------------------------------------------------

function planFromMetadata(value: unknown): "free" | "studio" | "premium" {
  return value === "studio" || value === "premium" ? value : "free";
}

function stripeDate(value: number | null | undefined): Date | null {
  return value ? new Date(value * 1000) : null;
}

async function syncSubscriptionToDB(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata?.userId;
  if (!userId) return;
  const subscriptionWithPeriod = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
  };

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id ?? null;
  const plan = planFromMetadata(subscription.metadata?.plan);
  const priceId = subscription.items.data[0]?.price.id ?? "";
  const values = {
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    plan,
    status: subscription.status,
    currentPeriodStart: stripeDate(subscriptionWithPeriod.current_period_start),
    currentPeriodEnd: stripeDate(subscriptionWithPeriod.current_period_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end ? 1 : 0,
    updatedAt: new Date(),
  };

  const [existing] = await db
    .select({ id: subscriptionsTable.id })
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, userId))
    .limit(1);

  if (existing) {
    await db.update(subscriptionsTable).set(values).where(eq(subscriptionsTable.id, existing.id));
  } else {
    await db.insert(subscriptionsTable).values(values);
  }

  await db
    .update(appUsersTable)
    .set({
      plan,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      updatedAt: new Date(),
    })
    .where(eq(appUsersTable.id, userId));
}

export async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (session.mode === "subscription" && session.subscription && stripe) {
        // Abonnement : on synchronise le plan. Les credits mensuels sont
        // attribues sur invoice.paid (couvre 1er paiement + renouvellements),
        // ce qui evite tout double credit.
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await syncSubscriptionToDB(subscription);
      } else if (session.mode === "payment" && userId) {
        // Pack de recharge : credits permanents ajoutes immediatement.
        const pack = session.metadata?.pack as keyof typeof CREDIT_PACKS | undefined;
        const amount = pack ? CREDIT_PACKS[pack] : undefined;
        if (amount) {
          await grantCredits(userId, amount, `recharge:${pack}`, session.id);
        }
      }
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as InvoiceWithSub;
      await syncInvoiceToDB(invoice);
      // Attribution / renouvellement des credits mensuels du plan.
      const userId = invoice.subscription_details?.metadata?.userId ?? invoice.metadata?.userId;
      const plan = planFromMetadata(invoice.subscription_details?.metadata?.plan);
      if (userId && invoice.subscription_details?.metadata?.plan) {
        await renewMonthlyCredits(userId, plan);
      }
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await syncInvoiceToDB(invoice);
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscriptionToDB(subscription);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await db.update(subscriptionsTable).set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(subscriptionsTable.stripeSubscriptionId, subscription.id));
      const userId = subscription.metadata?.userId;
      if (userId) {
        await db
          .update(appUsersTable)
          .set({ plan: "free", stripeSubscriptionId: null, updatedAt: new Date() })
          .where(eq(appUsersTable.id, userId));
        // Retour au quota gratuit.
        await renewMonthlyCredits(userId, "free");
      }
      break;
    }
  }
}

async function getStripeCustomerId(userId: string): Promise<string | null> {
  const [user] = await db.select().from(appUsersTable).where(eq(appUsersTable.id, userId)).limit(1);
  return user?.stripeCustomerId || null;
}
