import { pgTable, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { appUsersTable } from "./users";

// Journal append-only de tous les mouvements de crédits (audit + cockpit + transparence client)
export const creditLedgerTable = pgTable(
  "credit_ledger",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => appUsersTable.id, { onDelete: "cascade" }),
    delta: integer("delta").notNull(), // +crédité / -dépensé
    reason: text("reason").notNull(), // signup, renew:studio, recharge:pack_300, generation, export, lentille...
    balanceAfter: integer("balance_after").notNull().default(0),
    meta: text("meta"), // contexte libre (id projet, id session Stripe...)
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("credit_ledger_user_id_idx").on(table.userId)],
);

export type CreditLedgerEntry = typeof creditLedgerTable.$inferSelect;
export type InsertCreditLedgerEntry = typeof creditLedgerTable.$inferInsert;
