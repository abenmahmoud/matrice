import { and, eq, gte, lte } from "drizzle-orm";
import { appUsersTable, db } from "@workspace/db";
import { betaExpiringEmail } from "./emailTemplates.js";
import { notify } from "./notificationService.js";

function baseUrl(): string {
  return process.env["MATRICE_BASE_URL"] ?? "https://matrice.essuf.fr";
}

async function notifyExpiringUsers(daysLeft: 7 | 1, start: Date, end: Date): Promise<number> {
  const users = await db
    .select()
    .from(appUsersTable)
    .where(and(eq(appUsersTable.isBetaTester, true), gte(appUsersTable.betaExpiresAt, start), lte(appUsersTable.betaExpiresAt, end)));

  for (const user of users) {
    await notify({
      userId: user.id,
      type: daysLeft === 7 ? "beta_expiring_7d" : "beta_expiring_1d",
      title: daysLeft === 7 ? "Beta expire dans 7 jours" : "Beta expire demain",
      body: daysLeft === 7 ? "Ton acces Premium beta touche a sa fin la semaine prochaine." : "Dernier jour de ton acces Premium beta.",
      actionUrl: "/pricing",
      actionLabel: "Passer en Premium",
      email: betaExpiringEmail({ displayName: user.displayName || user.email, daysLeft, upgradeUrl: `${baseUrl()}/pricing` }),
    });
  }
  return users.length;
}

export async function runBetaExpiryCron(): Promise<{ notified_7d: number; notified_1d: number }> {
  const now = new Date();
  return {
    notified_7d: await notifyExpiringUsers(7, new Date(now.getTime() + 6 * 86_400_000), new Date(now.getTime() + 7 * 86_400_000)),
    notified_1d: await notifyExpiringUsers(1, now, new Date(now.getTime() + 86_400_000)),
  };
}
