import { boolean, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { appUsersTable } from "./users";
import { projectsTable } from "./projects";
import { salesEntriesTable } from "./sales";

export const payoutAccountsTable = pgTable("payout_accounts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => appUsersTable.id, { onDelete: "cascade" }),
  stripeAccountId: text("stripe_account_id").notNull(),
  status: text("status").notNull().default("pending"),
  chargesEnabled: boolean("charges_enabled").notNull().default(false),
  payoutsEnabled: boolean("payouts_enabled").notNull().default(false),
  detailsSubmitted: boolean("details_submitted").notNull().default(false),
  requirementsCurrentlyDue: jsonb("requirements_currently_due").$type<string[]>().notNull().default([]),
  onboardingUrl: text("onboarding_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("payout_accounts_user_id_unique").on(table.userId),
  uniqueIndex("payout_accounts_stripe_account_id_unique").on(table.stripeAccountId),
]);

export const channelConnectionsTable = pgTable("channel_connections", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => appUsersTable.id, { onDelete: "cascade" }),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  channel: text("channel").notNull(),
  externalAccount: text("external_account"),
  status: text("status").notNull().default("planned"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const salesSettlementsTable = pgTable("sales_settlements", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => appUsersTable.id, { onDelete: "cascade" }),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  payoutAccountId: text("payout_account_id").references(() => payoutAccountsTable.id, { onDelete: "set null" }),
  salesEntryId: text("sales_entry_id").references(() => salesEntriesTable.id, { onDelete: "set null" }),
  channel: text("channel").notNull().default("Matrice"),
  stripeCheckoutSessionId: text("stripe_checkout_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeChargeId: text("stripe_charge_id"),
  stripeTransferId: text("stripe_transfer_id"),
  stripePayoutId: text("stripe_payout_id"),
  grossAmountCents: integer("gross_amount_cents").notNull(),
  applicationFeeAmountCents: integer("application_fee_amount_cents").notNull(),
  netAmountCents: integer("net_amount_cents").notNull(),
  currency: text("currency").notNull().default("EUR"),
  status: text("status").notNull().default("pending"),
  kycStatus: text("kyc_status").notNull().default("pending"),
  liveMode: boolean("live_mode").notNull().default(false),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type PayoutAccount = typeof payoutAccountsTable.$inferSelect;
export type ChannelConnection = typeof channelConnectionsTable.$inferSelect;
export type SalesSettlement = typeof salesSettlementsTable.$inferSelect;
