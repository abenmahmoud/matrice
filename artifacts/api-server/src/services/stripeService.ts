import Stripe from "stripe";
import { db, appUsersTable, subscriptionsTable, invoicesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Stripe Configuration
// ---------------------------------------------------------------------------

const stripeSecretKey = process.env["STRIPE_SECRET_KEY"];
if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not configured");
}

const stripe = new Stripe(stripeSecretKey, { apiVersion: "2026-05-01" as Stripe.LatestApiVersion });

export { stripe };

// ---------------------------------------------------------------------------
// Price IDs (configure these in Stripe Dashboard)
// ---------------------------------------------------------------------------

export const STRIPE_PRICES = {
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
  // Get or create Stripe customer
  let customerId = await getStripeCustomerId(userId);

  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    });
    customerId = customer.id;

    await db.update(appUsersTable)
      .set({ stripeCustomerId: customerId })
      .where(eq(appUsersTable.id, userId));
  }

  const priceId = STRIPE_PRICES[plan];
  if (!priceId) {
    throw new Error(`Price ID for plan ${plan} is not configured`);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env["MATRICE_PUBLIC_BASE_URL"]}/billing?success=true`,
    cancel_url: `${process.env["MATRICE_PUBLIC_BASE_URL"]}/pricing?canceled=true`,
    subscription_data: {
      metadata: { userId, plan },
    },
    tax_id_collection: { enabled: true }, // Collecte TVA
    automatic_tax: { enabled: true }, // Stripe Tax automatique
  });

  return session;
}

// ---------------------------------------------------------------------------
// Customer Portal
// ---------------------------------------------------------------------------

export async function createCustomerPortalSession(userId: string): Promise<string> {
  const customerId = await getStripeCustomerId(userId);
  if (!customerId) {
    throw new Error("No Stripe customer found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env["MATRICE_PUBLIC_BASE_URL"]}/billing`,
  });

  return session.url;
}

// ---------------------------------------------------------------------------
// Subscription Management
// ---------------------------------------------------------------------------

export async function getUserSubscription(userId: string) {
  const [sub] = await db.select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, userId))
    .limit(1);
  return sub || null;
}

export async function cancelSubscription(userId: string) {
  const sub = await getUserSubscription(userId);
  if (!sub?.stripeSubscriptionId) {
    throw new Error("No active subscription");
  }

  await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await db.update(subscriptionsTable)
    .set({ cancelAtPeriodEnd: 1 })
    .where(eq(subscriptionsTable.id, sub.id));

  return { status: "canceling_at_period_end" };
}

export async function reactivateSubscription(userId: string) {
  const sub = await getUserSubscription(userId);
  if (!sub?.stripeSubscriptionId) {
    throw new Error("No subscription to reactivate");
  }

  await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  await db.update(subscriptionsTable)
    .set({ cancelAtPeriodEnd: 0 })
    .where(eq(subscriptionsTable.id, sub.id));

  return { status: "reactivated" };
}

// ---------------------------------------------------------------------------
// Invoice Management
// ---------------------------------------------------------------------------

export async function getUserInvoices(userId: string) {
  const customerId = await getStripeCustomerId(userId);
  if (!customerId) return [];

  const stripeInvoices = await stripe.invoices.list({
    customer: customerId,
    limit: 100,
  });

  return stripeInvoices.data;
}

export async function syncInvoiceToDB(stripeInvoice: Stripe.Invoice) {
  const userId = stripeInvoice.subscription_details?.metadata?.userId;
  if (!userId) return;

  const amount = (stripeInvoice.total / 100).toFixed(2);
  const vatRate = "20"; // TVA France par defaut
  const vatAmount = (parseFloat(amount) * 0.2).toFixed(2);
  const totalWithVat = amount;

  // Upsert invoice
  await db.insert(invoicesTable).values({
    userId,
    stripeInvoiceId: stripeInvoice.id,
    stripeCustomerId: stripeInvoice.customer as string,
    amount: amount as any,
    currency: stripeInvoice.currency || "eur",
    status: stripeInvoice.status || "draft",
    description: stripeInvoice.description || `Abonnement Matrice Narrative`,
    periodStart: stripeInvoice.period_start ? new Date(stripeInvoice.period_start * 1000) : null,
    periodEnd: stripeInvoice.period_end ? new Date(stripeInvoice.period_end * 1000) : null,
    pdfUrl: stripeInvoice.invoice_pdf || null,
    vatRate: vatRate as any,
    vatAmount: vatAmount as any,
    totalWithVat: totalWithVat as any,
  }).onConflictDoUpdate({
    target: invoicesTable.stripeInvoiceId,
    set: {
      status: stripeInvoice.status || "draft",
      pdfUrl: stripeInvoice.invoice_pdf || null,
      updatedAt: new Date(),
    },
  });
}

// ---------------------------------------------------------------------------
// Webhook Handlers
// ---------------------------------------------------------------------------

export async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, plan } = session.subscription_details?.metadata || {};
      if (!userId || !plan) return;

      await db.update(appUsersTable)
        .set({ plan })
        .where(eq(appUsersTable.id, userId));
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
      const userId = subscription.metadata?.userId;
      if (!userId) return;

      await db.update(subscriptionsTable)
        .set({
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end ? 1 : 0,
          updatedAt: new Date(),
        })
        .where(eq(subscriptionsTable.stripeSubscriptionId, subscription.id));

      // Update user plan
      const plan = subscription.metadata?.plan;
      if (plan) {
        await db.update(appUsersTable)
          .set({ plan })
          .where(eq(appUsersTable.id, userId));
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await db.update(subscriptionsTable)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(subscriptionsTable.stripeSubscriptionId, subscription.id));
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getStripeCustomerId(userId: string): Promise<string | null> {
  const [user] = await db.select()
    .from(appUsersTable)
    .where(eq(appUsersTable.id, userId))
    .limit(1);
  return user?.stripeCustomerId || null;
}
