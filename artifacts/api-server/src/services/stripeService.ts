import Stripe from "stripe";
import { db, appUsersTable, subscriptionsTable, invoicesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

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
// Price IDs
// ---------------------------------------------------------------------------

export const STRIPE_PRICES: Record<string, string> = {
  pro: process.env["STRIPE_PRICE_PRO"] || "",
  studio: process.env["STRIPE_PRICE_STUDIO"] || "",
  publish: process.env["STRIPE_PRICE_PUBLISH"] || "",
};

// ---------------------------------------------------------------------------
// Checkout Session
// ---------------------------------------------------------------------------

export async function createCheckoutSession(
  userId: string,
  email: string,
  plan: "pro" | "studio" | "publish"
): Promise<Stripe.Checkout.Session> {
  const s = ensureStripe();

  let customerId = await getStripeCustomerId(userId);
  if (!customerId) {
    const customer = await s.customers.create({ email, metadata: { userId } });
    customerId = customer.id;
    await db.update(appUsersTable).set({ stripeCustomerId: customerId }).where(eq(appUsersTable.id, userId));
  }

  const priceId = STRIPE_PRICES[plan];
  if (!priceId) throw new Error(`Price ID for plan ${plan} not configured`);

  const session = await s.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env["MATRICE_PUBLIC_BASE_URL"] || "https://matrice.essuf.fr"}/billing?success=true`,
    cancel_url: `${process.env["MATRICE_PUBLIC_BASE_URL"] || "https://matrice.essuf.fr"}/pricing?canceled=true`,
    metadata: { userId, plan },
    subscription_data: { metadata: { userId, plan } },
    tax_id_collection: { enabled: true },
    automatic_tax: { enabled: true },
  });
  return session;
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
    return_url: `${process.env["MATRICE_PUBLIC_BASE_URL"] || "https://matrice.essuf.fr"}/billing`,
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

export async function syncInvoiceToDB(stripeInvoice: Stripe.Invoice) {
  const invoiceWithDetails = stripeInvoice as Stripe.Invoice & {
    subscription_details?: { metadata?: Record<string, string> };
  };
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
    description: stripeInvoice.description || "Abonnement Matrice Narrative",
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

function planFromMetadata(value: unknown): "free" | "pro" | "studio" | "publish" {
  return value === "pro" || value === "studio" || value === "publish" ? value : "free";
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
      const plan = planFromMetadata(session.metadata?.plan);
      if (session.subscription && stripe) {
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await syncSubscriptionToDB(subscription);
      } else if (userId) {
        await db.update(appUsersTable).set({ plan, updatedAt: new Date() }).where(eq(appUsersTable.id, userId));
      }
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      await syncInvoiceToDB(invoice);
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
      }
      break;
    }
  }
}

async function getStripeCustomerId(userId: string): Promise<string | null> {
  const [user] = await db.select().from(appUsersTable).where(eq(appUsersTable.id, userId)).limit(1);
  return user?.stripeCustomerId || null;
}
