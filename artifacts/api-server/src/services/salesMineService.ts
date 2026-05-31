export type MineSettlementStatus = "pending" | "paid" | "blocked_kyc";

export type MineSalesSourceRow = {
  id: string;
  userId: string;
  projectId: string;
  projectTitle: string;
  channel: string;
  saleDate: Date;
  grossAmountCents: number;
  currency: string;
  settlement?: {
    status: string;
    kycStatus: string;
    updatedAt?: Date | null;
  } | null;
};

export type MineSalesEntry = {
  id: string;
  project_id: string;
  project_title: string;
  channel: string;
  date: string;
  gross_amount: number;
  currency: string;
  author_share: number;
  matrice_share: number;
  settlement_status: MineSettlementStatus;
  settlement_label: string;
  raw_settlement_status: string | null;
  kyc_status: string | null;
};

export type MineSalesPayload = {
  entries: MineSalesEntry[];
  totals: {
    gross_amount: number;
    author_share: number;
    matrice_share: number;
    paid_amount: number;
    pending_amount: number;
    blocked_kyc_amount: number;
    currency: string;
    author_percent: 90;
    matrice_percent: 10;
  };
};

export function buildMineSalesPayload(userId: string, rows: MineSalesSourceRow[]): MineSalesPayload {
  const ownRows = rows.filter((row) => row.userId === userId);
  const entries = ownRows.map(serializeMineSalesEntry);

  const totalsCents = entries.reduce(
    (acc, entry) => {
      const gross = amountToCents(entry.gross_amount);
      const author = amountToCents(entry.author_share);
      const matrice = amountToCents(entry.matrice_share);
      acc.gross += gross;
      acc.author += author;
      acc.matrice += matrice;
      if (entry.settlement_status === "paid") acc.paid += author;
      else if (entry.settlement_status === "blocked_kyc") acc.blockedKyc += author;
      else acc.pending += author;
      return acc;
    },
    { gross: 0, author: 0, matrice: 0, paid: 0, pending: 0, blockedKyc: 0 },
  );

  return {
    entries,
    totals: {
      gross_amount: centsToAmount(totalsCents.gross),
      author_share: centsToAmount(totalsCents.author),
      matrice_share: centsToAmount(totalsCents.matrice),
      paid_amount: centsToAmount(totalsCents.paid),
      pending_amount: centsToAmount(totalsCents.pending),
      blocked_kyc_amount: centsToAmount(totalsCents.blockedKyc),
      currency: entries[0]?.currency ?? "EUR",
      author_percent: 90,
      matrice_percent: 10,
    },
  };
}

export function serializeMineSalesEntry(row: MineSalesSourceRow): MineSalesEntry {
  const split = splitSaleCents(row.grossAmountCents);
  const status = normalizeSettlementStatus(row.settlement);
  return {
    id: row.id,
    project_id: row.projectId,
    project_title: row.projectTitle,
    channel: row.channel,
    date: row.saleDate.toISOString(),
    gross_amount: centsToAmount(row.grossAmountCents),
    currency: row.currency,
    author_share: centsToAmount(split.authorShareCents),
    matrice_share: centsToAmount(split.matriceShareCents),
    settlement_status: status,
    settlement_label: settlementStatusLabel(status),
    raw_settlement_status: row.settlement?.status ?? null,
    kyc_status: row.settlement?.kycStatus ?? null,
  };
}

export function splitSaleCents(grossAmountCents: number): { authorShareCents: number; matriceShareCents: number } {
  const matriceShareCents = Math.round(grossAmountCents * 0.1);
  return {
    authorShareCents: grossAmountCents - matriceShareCents,
    matriceShareCents,
  };
}

export function normalizeSettlementStatus(settlement: MineSalesSourceRow["settlement"]): MineSettlementStatus {
  if (!settlement) return "pending";
  if (settlement.kycStatus !== "complete") return "blocked_kyc";
  if (["payout_paid", "paid_out", "settled"].includes(settlement.status)) return "paid";
  return "pending";
}

function settlementStatusLabel(status: MineSettlementStatus): string {
  if (status === "paid") return "Verse";
  if (status === "blocked_kyc") return "Bloque KYC";
  return "En attente";
}

function centsToAmount(cents: number): number {
  return Math.round(cents) / 100;
}

function amountToCents(amount: number): number {
  return Math.round(amount * 100);
}
