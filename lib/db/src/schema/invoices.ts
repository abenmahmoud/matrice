import { pgTable, text, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { appUsersTable } from "./users";

export const invoicesTable = pgTable("invoices", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => appUsersTable.id, { onDelete: "cascade" }),
  stripeInvoiceId: text("stripe_invoice_id"),
  stripeCustomerId: text("stripe_customer_id"),
  amount: numeric("amount").notNull().default("0"),
  currency: text("currency").notNull().default("eur"),
  status: text("status").notNull().default("draft"), // draft, open, paid, void, uncollectible
  description: text("description").notNull().default(""),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  pdfUrl: text("pdf_url"),
  vatRate: numeric("vat_rate").notNull().default("20"), // TVA France 20%
  vatAmount: numeric("vat_amount").notNull().default("0"),
  totalWithVat: numeric("total_with_vat").notNull().default("0"),
  lineItems: text("line_items"), // JSON array of items
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Invoice = typeof invoicesTable.$inferSelect;
export type InsertInvoice = typeof invoicesTable.$inferInsert;
