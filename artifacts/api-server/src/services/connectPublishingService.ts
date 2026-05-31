import Stripe from "stripe";
import { and, eq } from "drizzle-orm";
import {
  appUsersTable,
  channelConnectionsTable,
  db,
  payoutAccountsTable,
  projectsTable,
  salesSettlementsTable,
} from "@workspace/db";

const PLATFORM_FEE_PERCENT = 10;

export function computeApplicationFeeCents(grossAmountCents: number): number {
  return Math.round(grossAmountCents * PLATFORM_FEE_PERCENT / 100);
}

export function isStripeLiveMode(): boolean {
  return Boolean(process.env["STRIPE_SECRET_KEY"]?.startsWith("sk_live_"));
}

export function isConnectLiveEnabled(): boolean {
  return process.env["MATRICE_CONNECT_LIVE"] === "true";
}

export function assertConnectModeAllowed(): void {
  // TODO: vérifier DAC7 + TVA commission avec comptable avant activation live.
  if (isStripeLiveMode() && !isConnectLiveEnabled()) {
    throw new Error("CONNECT_LIVE_DISABLED");
  }
}

let connectStripe: Stripe | null = null;

function ensureStripe(): Stripe {
  if (connectStripe) return connectStripe;
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) throw new Error("STRIPE_NOT_CONFIGURED");
  connectStripe = new Stripe(key, { apiVersion: "2026-05-01" as Stripe.LatestApiVersion });
  return connectStripe;
}

function publicBaseUrl(): string {
  return (process.env["MATRICE_PUBLIC_BASE_URL"] ?? "https://matrice.essuf.fr").replace(/\/$/, "");
}

export async function getOrCreatePayoutAccount(userId: string, email: string) {
  const [existing] = await db.select().from(payoutAccountsTable).where(eq(payoutAccountsTable.userId, userId)).limit(1);
  if (existing) return existing;

  const s = ensureStripe();
  assertConnectModeAllowed();
  const account = await s.accounts.create({
    country: process.env["MATRICE_CONNECT_COUNTRY"] ?? "FR",
    email,
    capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
    controller: {
      losses: { payments: "application" },
      fees: { payer: "application" },
      stripe_dashboard: { type: "express" },
      requirement_collection: "stripe",
    },
    metadata: { userId, product: "matrice_publish" },
  } as any);

  const [created] = await db.insert(payoutAccountsTable).values({
    userId,
    stripeAccountId: account.id,
    status: account.details_submitted ? "active" : "pending",
    chargesEnabled: Boolean(account.charges_enabled),
    payoutsEnabled: Boolean(account.payouts_enabled),
    detailsSubmitted: Boolean(account.details_submitted),
    requirementsCurrentlyDue: account.requirements?.currently_due ?? [],
  }).returning();
  return created;
}

export async function createPayoutOnboardingLink(userId: string, email: string): Promise<{ account: typeof payoutAccountsTable.$inferSelect; url: string }> {
  const s = ensureStripe();
  const account = await getOrCreatePayoutAccount(userId, email);
  const link = await s.accountLinks.create({
    account: account.stripeAccountId,
    type: "account_onboarding",
    refresh_url: `${publicBaseUrl()}/billing?connect=refresh`,
    return_url: `${publicBaseUrl()}/billing?connect=return`,
  });
  await db.update(payoutAccountsTable).set({ onboardingUrl: link.url, updatedAt: new Date() }).where(eq(payoutAccountsTable.id, account.id));
  return { account, url: link.url };
}

export async function syncPayoutAccountFromStripe(account: Stripe.Account) {
  const userId = account.metadata?.userId;
  const values = {
    status: account.details_submitted && account.payouts_enabled ? "active" : "pending",
    chargesEnabled: Boolean(account.charges_enabled),
    payoutsEnabled: Boolean(account.payouts_enabled),
    detailsSubmitted: Boolean(account.details_submitted),
    requirementsCurrentlyDue: account.requirements?.currently_due ?? [],
    updatedAt: new Date(),
  };
  const [updated] = await db.update(payoutAccountsTable).set(values).where(eq(payoutAccountsTable.stripeAccountId, account.id)).returning();
  if (!updated && userId) {
    await db.insert(payoutAccountsTable).values({ userId, stripeAccountId: account.id, ...values });
  }
}

export async function getPayoutStatus(userId: string) {
  const [account] = await db.select().from(payoutAccountsTable).where(eq(payoutAccountsTable.userId, userId)).limit(1);
  return {
    account,
    kyc_complete: Boolean(account?.detailsSubmitted && account?.payoutsEnabled && account?.chargesEnabled),
    connect_live_enabled: isConnectLiveEnabled(),
    stripe_mode: isStripeLiveMode() ? "live" : "test",
  };
}

export async function createDestinationCheckout(input: {
  userId: string;
  email: string;
  projectId: string;
  channel: string;
  amountCents: number;
  currency: string;
}) {
  assertConnectModeAllowed();
  const s = ensureStripe();
  const [project] = await db.select().from(projectsTable).where(and(eq(projectsTable.id, input.projectId), eq(projectsTable.ownerUserId, input.userId))).limit(1);
  if (!project) throw new Error("PROJECT_NOT_FOUND");

  const account = await getOrCreatePayoutAccount(input.userId, input.email);
  if (!account.chargesEnabled || !account.payoutsEnabled || !account.detailsSubmitted) {
    throw new Error("KYC_INCOMPLETE");
  }

  const applicationFeeAmount = computeApplicationFeeCents(input.amountCents);
  const [settlement] = await db.insert(salesSettlementsTable).values({
    userId: input.userId,
    projectId: input.projectId,
    payoutAccountId: account.id,
    channel: input.channel,
    grossAmountCents: input.amountCents,
    applicationFeeAmountCents: applicationFeeAmount,
    netAmountCents: input.amountCents - applicationFeeAmount,
    currency: input.currency.toUpperCase(),
    status: "checkout_created",
    kycStatus: "complete",
    liveMode: isStripeLiveMode(),
  }).returning();

  const session = await s.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: input.currency.toLowerCase(),
        product_data: { name: `${project.title ?? "Oeuvre Matrice"} — ${input.channel}` },
        unit_amount: input.amountCents,
      },
      quantity: 1,
    }],
    success_url: `${publicBaseUrl()}/projects/${input.projectId}/publish?connect=success`,
    cancel_url: `${publicBaseUrl()}/projects/${input.projectId}/publish?connect=cancel`,
    metadata: { userId: input.userId, projectId: input.projectId, settlementId: settlement.id },
    payment_intent_data: {
      application_fee_amount: applicationFeeAmount,
      transfer_data: { destination: account.stripeAccountId },
      metadata: { userId: input.userId, projectId: input.projectId, settlementId: settlement.id },
    },
  });

  await db.update(salesSettlementsTable).set({ stripeCheckoutSessionId: session.id, updatedAt: new Date() }).where(eq(salesSettlementsTable.id, settlement.id));
  return { session, settlement: { ...settlement, stripeCheckoutSessionId: session.id } };
}

export async function listPublishingFinance(userId: string, projectId: string) {
  const [account] = await db.select().from(payoutAccountsTable).where(eq(payoutAccountsTable.userId, userId)).limit(1);
  const connections = await db.select().from(channelConnectionsTable).where(and(eq(channelConnectionsTable.userId, userId), eq(channelConnectionsTable.projectId, projectId)));
  const settlements = await db.select().from(salesSettlementsTable).where(and(eq(salesSettlementsTable.userId, userId), eq(salesSettlementsTable.projectId, projectId)));
  return { payout_account: account ?? null, channel_connections: connections, settlements };
}

export async function upsertChannelConnection(input: { userId: string; projectId: string; channel: string; externalAccount?: string; status?: string }) {
  const [project] = await db.select().from(projectsTable).where(and(eq(projectsTable.id, input.projectId), eq(projectsTable.ownerUserId, input.userId))).limit(1);
  if (!project) throw new Error("PROJECT_NOT_FOUND");
  const [created] = await db.insert(channelConnectionsTable).values({
    userId: input.userId,
    projectId: input.projectId,
    channel: input.channel,
    externalAccount: input.externalAccount ?? null,
    status: input.status ?? "planned",
  }).returning();
  return created;
}

export async function handleConnectWebhookEvent(event: Stripe.Event): Promise<boolean> {
  if (event.type === "account.updated") {
    await syncPayoutAccountFromStripe(event.data.object as Stripe.Account);
    return true;
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const settlementId = session.metadata?.settlementId;
    if (settlementId) {
      await db.update(salesSettlementsTable).set({
        status: "paid",
        stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
        updatedAt: new Date(),
      }).where(eq(salesSettlementsTable.id, settlementId));
      return true;
    }
  }
  if (event.type === "charge.succeeded") {
    const charge = event.data.object as Stripe.Charge;
    const settlementId = charge.metadata?.settlementId;
    if (settlementId) {
      await db.update(salesSettlementsTable).set({
        status: "charge_succeeded",
        stripeChargeId: charge.id,
        stripeTransferId: typeof charge.transfer === "string" ? charge.transfer : charge.transfer?.id ?? null,
        updatedAt: new Date(),
      }).where(eq(salesSettlementsTable.id, settlementId));
      return true;
    }
  }
  if (event.type.startsWith("payout.")) {
    const payout = event.data.object as Stripe.Payout;
    await db.update(salesSettlementsTable).set({
      stripePayoutId: payout.id,
      status: event.type.replace(".", "_"),
      updatedAt: new Date(),
    }).where(eq(salesSettlementsTable.stripePayoutId, payout.id));
    return true;
  }
  return false;
}
