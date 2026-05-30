import { db, appUsersTable, creditLedgerTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

// Crédits offerts par le plan, renouvelés chaque mois (use-it-or-lose-it).
export const PLAN_MONTHLY_CREDITS: Record<string, number> = {
  free: 50,
  studio: 300,
  premium: 800,
};

// Coût en crédits par type d'action.
export const ACTION_COSTS = {
  generation: 1,
  export: 5,
  lentille: 10,
} as const;
export type ActionType = keyof typeof ACTION_COSTS;

// Packs de recharge (crédits permanents).
export const CREDIT_PACKS: Record<string, number> = {
  pack_100: 100,
  pack_300: 300,
  pack_1000: 1000,
};

export type CreditBalance = { monthly: number; extra: number; total: number };

export async function getBalance(userId: string): Promise<CreditBalance> {
  const [user] = await db
    .select({ monthly: appUsersTable.monthlyCredits, extra: appUsersTable.extraCredits })
    .from(appUsersTable)
    .where(eq(appUsersTable.id, userId))
    .limit(1);
  const monthly = user?.monthly ?? 0;
  const extra = user?.extra ?? 0;
  return { monthly, extra, total: monthly + extra };
}

async function recordLedger(
  userId: string,
  delta: number,
  reason: string,
  balanceAfter: number,
  meta?: string,
): Promise<void> {
  await db.insert(creditLedgerTable).values({ userId, delta, reason, balanceAfter, meta: meta ?? null });
}

// Ajoute des crédits permanents (recharge). reason ex: "recharge:pack_300".
export async function grantCredits(userId: string, amount: number, reason: string, meta?: string): Promise<CreditBalance> {
  const bal = await getBalance(userId);
  const newExtra = bal.extra + amount;
  await db.update(appUsersTable).set({ extraCredits: newExtra, updatedAt: new Date() }).where(eq(appUsersTable.id, userId));
  const total = bal.monthly + newExtra;
  await recordLedger(userId, amount, reason, total, meta);
  return { monthly: bal.monthly, extra: newExtra, total };
}

// (Re)met les crédits mensuels au quota du plan. Ne touche pas aux crédits achetés.
export async function renewMonthlyCredits(userId: string, plan: string): Promise<CreditBalance> {
  const monthly = PLAN_MONTHLY_CREDITS[plan] ?? PLAN_MONTHLY_CREDITS["free"] ?? 0;
  const renewAt = new Date();
  renewAt.setMonth(renewAt.getMonth() + 1);
  await db
    .update(appUsersTable)
    .set({ monthlyCredits: monthly, creditsRenewAt: renewAt, updatedAt: new Date() })
    .where(eq(appUsersTable.id, userId));
  const bal = await getBalance(userId);
  await recordLedger(userId, monthly, `renew:${plan}`, bal.total);
  return bal;
}

export type SpendResult =
  | { ok: true; balance: CreditBalance }
  | { ok: false; needed: number; available: number };

// Débite un coût : d'abord le mensuel, puis l'acheté.
export async function spendCredits(userId: string, amount: number, reason: string, meta?: string): Promise<SpendResult> {
  const bal = await getBalance(userId);
  if (bal.total < amount) {
    return { ok: false, needed: amount, available: bal.total };
  }
  let remaining = amount;
  const fromMonthly = Math.min(bal.monthly, remaining);
  const newMonthly = bal.monthly - fromMonthly;
  remaining -= fromMonthly;
  const newExtra = bal.extra - remaining;
  await db
    .update(appUsersTable)
    .set({ monthlyCredits: newMonthly, extraCredits: newExtra, updatedAt: new Date() })
    .where(eq(appUsersTable.id, userId));
  const total = newMonthly + newExtra;
  await recordLedger(userId, -amount, reason, total, meta);
  return { ok: true, balance: { monthly: newMonthly, extra: newExtra, total } };
}

export async function getHistory(userId: string, limit = 50) {
  return db
    .select()
    .from(creditLedgerTable)
    .where(eq(creditLedgerTable.userId, userId))
    .orderBy(desc(creditLedgerTable.createdAt))
    .limit(limit);
}
